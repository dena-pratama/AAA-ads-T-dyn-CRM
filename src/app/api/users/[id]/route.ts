import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const userUpdateSchema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional().or(z.literal("")),
    role: z.enum(["SUPER_ADMIN", "CLIENT_ADMIN", "CS"]).optional(),
    clientId: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
});

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "SUPER_ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        // ... rest of function using id
        const json = await req.json();
        const body = userUpdateSchema.parse(json);

        const updateData: any = { ...body };

        // Handle password update if provided
        if (body.password) {
            updateData.password = await bcrypt.hash(body.password, 10);
        } else {
            delete updateData.password;
        }

        // Role specific logic
        if (body.role === "SUPER_ADMIN") {
            updateData.clientId = null;
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
        });

        // ...
        const { password: _, ...safeUser } = user;
        return NextResponse.json(safeUser);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 422 });
        }
        console.error("Error updating user:", error);
        return new NextResponse(`Internal Server Error: ${error instanceof Error ? error.message : "Unknown error"}`, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "SUPER_ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        // Prevent self-deletion
        if (id === session.user.id) {
            return new NextResponse("Cannot delete yourself", { status: 400 });
        }

        await prisma.user.delete({
            where: { id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Error deleting user:", error);
        return new NextResponse(`Failed to delete user: ${error instanceof Error ? error.message : "Unknown error"}`, { status: 500 });
    }
}
