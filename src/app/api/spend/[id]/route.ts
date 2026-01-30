import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { z } from "zod";

const updateSpendSchema = z.object({
    spend: z.number().optional(),
    impressions: z.number().int().optional(),
    clicks: z.number().int().optional(),
    reach: z.number().int().optional(),
    campaignId: z.string().optional(),
    date: z.string().optional(),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/spend/[id] - Get single spend record
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const spendLog = await prisma.adSpendLog.findUnique({
            where: { id },
            include: {
                campaign: { select: { id: true, name: true } },
                client: { select: { id: true, name: true } },
            },
        });

        if (!spendLog) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // Check access
        if (user.role !== "SUPER_ADMIN" && spendLog.clientId !== user.clientId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(spendLog);
    } catch (error) {
        console.error("GET /api/spend/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to fetch spend record" },
            { status: 500 }
        );
    }
}

// PUT /api/spend/[id] - Update spend record (inline editing)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check access first
        const existing = await prisma.adSpendLog.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        if (user.role !== "SUPER_ADMIN" && existing.clientId !== user.clientId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const validated = updateSpendSchema.parse(body);

        const updateData: Record<string, unknown> = {};
        if (validated.spend !== undefined) updateData.spend = validated.spend;
        if (validated.impressions !== undefined) updateData.impressions = validated.impressions;
        if (validated.clicks !== undefined) updateData.clicks = validated.clicks;
        if (validated.reach !== undefined) updateData.reach = validated.reach;
        if (validated.campaignId) updateData.campaignId = validated.campaignId;
        if (validated.date) updateData.date = new Date(validated.date);

        const updated = await prisma.adSpendLog.update({
            where: { id },
            data: updateData,
            include: {
                campaign: { select: { id: true, name: true } },
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
        console.error("PUT /api/spend/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to update spend record" },
            { status: 500 }
        );
    }
}

// DELETE /api/spend/[id] - Delete spend record
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check access first
        const existing = await prisma.adSpendLog.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        if (user.role !== "SUPER_ADMIN" && existing.clientId !== user.clientId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.adSpendLog.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/spend/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to delete spend record" },
            { status: 500 }
        );
    }
}
