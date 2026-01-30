import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// GET /api/spend - List spend data with filters
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get("clientId");
        const campaignId = searchParams.get("campaignId");
        const platform = searchParams.get("platform");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const limit = parseInt(searchParams.get("limit") || "100");
        const offset = parseInt(searchParams.get("offset") || "0");

        // Build where clause
        const where: Record<string, unknown> = {};

        // Role-based filtering
        if (user.role === "SUPER_ADMIN") {
            if (clientId) where.clientId = clientId;
        } else if (user.clientId) {
            where.clientId = user.clientId;
        } else {
            return NextResponse.json({ error: "No client access" }, { status: 403 });
        }

        if (campaignId) where.campaignId = campaignId;
        if (platform) where.platform = platform;
        if (startDate || endDate) {
            where.date = {};
            if (startDate) (where.date as Record<string, Date>).gte = new Date(startDate);
            if (endDate) (where.date as Record<string, Date>).lte = new Date(endDate);
        }

        const [spendLogs, total] = await Promise.all([
            prisma.adSpendLog.findMany({
                where,
                include: {
                    campaign: {
                        select: { id: true, name: true }
                    },
                    client: {
                        select: { id: true, name: true }
                    }
                },
                orderBy: { date: "desc" },
                take: limit,
                skip: offset,
            }),
            prisma.adSpendLog.count({ where }),
        ]);

        return NextResponse.json({
            data: spendLogs,
            total,
            limit,
            offset,
        });
    } catch (error) {
        console.error("GET /api/spend error:", error);
        return NextResponse.json(
            { error: "Failed to fetch spend data" },
            { status: 500 }
        );
    }
}
