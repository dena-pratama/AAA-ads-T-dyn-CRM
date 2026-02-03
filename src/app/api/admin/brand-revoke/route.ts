import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { z } from "zod";

const bodySchema = z.object({
  userId: z.string(),
  brandId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only SUPER_ADMIN and CLIENT_ADMIN can revoke brands
    if (!["SUPER_ADMIN", "CLIENT_ADMIN"].includes(user.role)) {
      return NextResponse.json(
        { error: "Only OWNER/ADMIN can revoke brand access" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, brandId } = bodySchema.parse(body);

    // Verify brand belongs to same client
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

    // Delete membership
    const deleted = await prisma.brandMembership.deleteMany({
      where: { userId, brandId },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: "Membership not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Brand access revoked successfully",
    });
  } catch (error) {
    console.error("Brand revoke error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
