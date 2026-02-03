import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { z } from "zod";
import { BrandRole } from "@prisma/client";

const bodySchema = z.object({
  userId: z.string(),
  brandId: z.string(),
  role: z.enum(["OWNER", "ADMIN", "VIEWER"]).default("VIEWER"),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only SUPER_ADMIN and CLIENT_ADMIN can assign brands
    if (!["SUPER_ADMIN", "CLIENT_ADMIN"].includes(user.role)) {
      return NextResponse.json(
        { error: "Only OWNER/ADMIN can assign brands" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, brandId, role } = bodySchema.parse(body);

    // Verify target user exists and belongs to same client
    const targetUser = await prisma.user.findFirst({
      where: {
        id: userId,
        ...(user.role !== "SUPER_ADMIN" && user.clientId && { clientId: user.clientId }),
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found or does not belong to your client" },
        { status: 404 }
      );
    }

    // Verify brand exists and belongs to same client
    const brand = await prisma.brand.findFirst({
      where: {
        id: brandId,
        ...(user.role !== "SUPER_ADMIN" && user.clientId && { clientId: user.clientId }),
      },
    });

    if (!brand) {
      return NextResponse.json(
        { error: "Brand not found or does not belong to your client" },
        { status: 404 }
      );
    }

    // Create or update membership
    const membership = await prisma.brandMembership.upsert({
      where: {
        userId_brandId: { userId, brandId },
      },
      update: { role: role as BrandRole },
      create: {
        userId,
        brandId,
        role: role as BrandRole,
      },
    });

    return NextResponse.json({
      success: true,
      membership: {
        id: membership.id,
        userId: membership.userId,
        brandId: membership.brandId,
        role: membership.role,
      },
    });
  } catch (error) {
    console.error("Brand assign error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
