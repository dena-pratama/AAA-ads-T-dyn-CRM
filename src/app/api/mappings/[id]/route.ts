import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { z } from "zod";

const updateMappingSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    columnMappings: z.record(z.string(), z.string()).optional(),
    transformations: z.record(z.string(), z.any()).optional(),
    isDefault: z.boolean().optional(),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/mappings/[id] - Get single mapping
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const mapping = await prisma.mappingConfig.findUnique({
            where: { id },
            include: {
                client: { select: { id: true, name: true } },
            },
        });

        if (!mapping) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // Access check
        if (user.role !== "SUPER_ADMIN" && mapping.clientId !== user.clientId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(mapping);
    } catch (error) {
        console.error("GET /api/mappings/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to fetch mapping" },
            { status: 500 }
        );
    }
}

// PUT /api/mappings/[id] - Update mapping
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const existing = await prisma.mappingConfig.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        if (user.role !== "SUPER_ADMIN" && existing.clientId !== user.clientId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const validated = updateMappingSchema.parse(body);

        // If setting as default, unset other defaults
        if (validated.isDefault) {
            await prisma.mappingConfig.updateMany({
                where: {
                    clientId: existing.clientId,
                    platform: existing.platform,
                    isDefault: true,
                    id: { not: id },
                },
                data: { isDefault: false },
            });
        }

        const updated = await prisma.mappingConfig.update({
            where: { id },
            data: validated,
            include: {
                client: { select: { id: true, name: true } },
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 }
            );
        }
        console.error("PUT /api/mappings/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to update mapping" },
            { status: 500 }
        );
    }
}

// DELETE /api/mappings/[id] - Delete mapping
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const existing = await prisma.mappingConfig.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        if (user.role !== "SUPER_ADMIN" && existing.clientId !== user.clientId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.mappingConfig.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/mappings/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to delete mapping" },
            { status: 500 }
        );
    }
}
