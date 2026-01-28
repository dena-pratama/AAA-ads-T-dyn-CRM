import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const clientUpdateSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    currency: z.string().optional(),
    description: z.string().optional().or(z.literal("")),
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
        const json = await req.json();
        const body = clientUpdateSchema.parse(json);

        // Check if name is taken (if changing name)
        if (body.name) {
            const existingClient = await prisma.client.findFirst({
                where: {
                    name: body.name,
                    id: { not: id } // Exclude current client
                }
            });

            if (existingClient) {
                return new NextResponse("Client name already exists", { status: 409 });
            }
        }

        const client = await prisma.client.update({
            where: { id },
            data: body,
        });

        return NextResponse.json(client);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 422 });
        }
        console.error("Error updating client:", error);
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

        // Optional: Check for critical dependencies before delete?
        // For now, relies on Prisma Cascade or SetNull behaviors defined in schema

        await prisma.client.delete({
            where: { id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Error deleting client:", error);
        return new NextResponse(`Failed to delete client: ${error instanceof Error ? error.message : "Unknown error"}`, { status: 500 });
    }
}
