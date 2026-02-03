import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { z } from "zod";
import { Marketplace } from "@prisma/client";

const bodySchema = z.object({
  name: z.string().min(1),
  marketplace: z.enum(["TIKTOK", "SHOPEE", "LAZADA", "TOKOPEDIA"]),
  description: z.string().optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const brands = await prisma.brand.findMany({
      where: {
        ...(user.clientId && { clientId: user.clientId }),
        isActive: true,
      },
      include: {
        _count: { select: { reports: true, memberships: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ brands });
  } catch (error) {
    console.error("List brands error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only SUPER_ADMIN and CLIENT_ADMIN can create brands
    if (!["SUPER_ADMIN", "CLIENT_ADMIN"].includes(user.role)) {
      return NextResponse.json(
        { error: "Only OWNER/ADMIN can create brands" },
        { status: 403 }
      );
    }

    if (!user.clientId) {
      return NextResponse.json(
        { error: "User must be assigned to a client" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, marketplace, description } = bodySchema.parse(body);

    const brand = await prisma.brand.create({
      data: {
        clientId: user.clientId,
        name,
        marketplace: marketplace as Marketplace,
        description,
      },
    });

    // Auto-assign creator as OWNER
    await prisma.brandMembership.create({
      data: {
        userId: user.id,
        brandId: brand.id,
        role: "OWNER",
      },
    });

    return NextResponse.json({ brand }, { status: 201 });
  } catch (error) {
    console.error("Create brand error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
