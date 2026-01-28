import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const session = await auth();

    // Only SUPER_ADMIN can view all users
    if (!session || session.user.role !== "SUPER_ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                client: {
                    select: { name: true },
                },
            },
        });

        // Safe return (exclude password)
        const safeUsers = users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            clientName: user.client?.name || "-",
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            image: user.image,
        }));

        return NextResponse.json(safeUsers);
    } catch (error) {
        console.error("Error fetching users:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
