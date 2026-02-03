import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canAccessBrand } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Find report
    const report = await prisma.antigravityReport.findFirst({
      where: {
        id,
        ...(user.clientId && { clientId: user.clientId }),
      },
      include: {
        brand: {
          select: { id: true, name: true, marketplace: true },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check brand access
    if (!canAccessBrand(user, report.brandId)) {
      return NextResponse.json(
        { error: "You do not have access to this report" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      report: {
        id: report.id,
        brandId: report.brandId,
        brandName: report.brand.name,
        marketplace: report.marketplace,
        status: report.status,
        createdAt: report.createdAt,
        processedAt: report.processedAt,
        kelolaFileName: report.kelolaFileName,
        incomeFileName: report.incomeFileName,
        result: report.resultJson,
        error: report.errorJson,
      },
    });
  } catch (error) {
    console.error("Get report detail error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const report = await prisma.antigravityReport.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (!canAccessBrand(user, report.brandId)) {
        return NextResponse.json(
          { error: "You do not have access to delete this report" },
          { status: 403 }
        );
    }

    await prisma.antigravityReport.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
