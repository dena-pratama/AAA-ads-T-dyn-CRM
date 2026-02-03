import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canAccessBrand } from "@/lib/session";
import { z } from "zod";

const querySchema = z.object({
  brandId: z.string().optional(),
  marketplace: z.enum(["TIKTOK", "SHOPEE", "LAZADA", "TOKOPEDIA"]).optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = querySchema.parse({
      brandId: searchParams.get("brandId") || undefined,
      marketplace: searchParams.get("marketplace") || undefined,
      limit: searchParams.get("limit") || 50,
    });

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // Always scope by clientId
    if (user.clientId) {
      where.clientId = user.clientId;
    }

    // If brandId specified, verify access
    if (params.brandId) {
      if (!canAccessBrand(user, params.brandId)) {
        return NextResponse.json(
          { error: "You do not have access to this brand" },
          { status: 403 }
        );
      }
      where.brandId = params.brandId;
    } else {
      // Filter to only brands user has access to
      if (user.allowedBrandIds && user.allowedBrandIds.length > 0) {
        where.brandId = { in: user.allowedBrandIds };
      }
    }

    if (params.marketplace) {
      where.marketplace = params.marketplace;
    }

    const reports = await prisma.antigravityReport.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: params.limit,
      include: {
        brand: {
          select: { id: true, name: true, marketplace: true },
        },
      },
    });

    // Map results to include summary info
    const result = reports.map((r) => ({
      id: r.id,
      brandId: r.brandId,
      brandName: r.brand.name,
      marketplace: r.marketplace,
      status: r.status,
      createdAt: r.createdAt,
      processedAt: r.processedAt,
      kelolaFileName: r.kelolaFileName,
      incomeFileName: r.incomeFileName,
      totalSettlement:
        r.status === "DONE" && r.resultJson
          ? (r.resultJson as { summaryGlobal?: { totalSettlement?: number } }).summaryGlobal?.totalSettlement
          : null,
      dataPeriod:
        r.status === "DONE" && r.resultJson
          ? (r.resultJson as { summaryDaily?: Array<{ date: string }> }).summaryDaily?.[0]?.date || null
          : null,
    }));

    return NextResponse.json({ reports: result });
  } catch (error) {
    console.error("List reports error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
