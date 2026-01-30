
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const querySchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    platform: z.enum(["all", "META", "GOOGLE", "TIKTOK", "OTHER"]).default("all").optional(),
});

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ clientId: string }> }
) {
    const params = await props.params;
    try {
        const user = await getCurrentUser();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { clientId } = params;

        // Access control
        if (user.role !== "SUPER_ADMIN" && user.clientId !== clientId) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Parse query params
        const { searchParams } = new URL(req.url);
        const query = querySchema.safeParse({
            startDate: searchParams.get("startDate") || undefined,
            endDate: searchParams.get("endDate") || undefined,
            platform: searchParams.get("platform") || "all",
        });

        if (!query.success) {
            return new NextResponse("Invalid query parameters", { status: 400 });
        }

        const { startDate, endDate, platform } = query.data;

        // Date filter
        const dateFilter: Record<string, any> = {};
        if (startDate && endDate) {
            dateFilter.date = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        // Platform filter
        const platformFilter: Record<string, any> = {};
        if (platform && platform !== "all") {
            platformFilter.platform = platform;
        }

        // 1. Get Campaign Spend Data
        const spendData = await prisma.adSpendLog.groupBy({
            by: ["campaignName", "platform"],
            where: {
                clientId,
                ...dateFilter,
                ...platformFilter,
            },
            _sum: {
                spend: true,
                impressions: true,
                clicks: true,
            },
        });

        // 2. Get Default Pipeline for Stage Metadata
        const pipeline = await prisma.pipeline.findFirst({
            where: { clientId, isDefault: true },
            select: { stages: true }
        });

        const stages = (pipeline?.stages as any[]) || [];

        // 3. Get Leads Count per Campaign AND Stage
        const leadFilter: any = {};
        if (startDate && endDate) {
            leadFilter.leadDate = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        const leadsData = await prisma.lead.groupBy({
            by: ["campaignName", "currentStage"],
            where: {
                clientId,
                ...leadFilter,
            },
            _count: {
                id: true
            },
            _sum: {
                value: true
            }
        });

        // Map leads to a nested dictionary: campaignName -> { total: X, revenue: Y, stages: { stageId: count } }
        type LeadStat = {
            count: number;
            revenue: number;
            byStage: Record<string, number>;
        };
        const leadsMap: Record<string, LeadStat> = {};

        leadsData.forEach((item: any) => {
            if (!item.campaignName) return;

            if (!leadsMap[item.campaignName]) {
                leadsMap[item.campaignName] = { count: 0, revenue: 0, byStage: {} };
            }

            const stat = leadsMap[item.campaignName];
            stat.count += item._count.id;
            stat.revenue += Number(item._sum.value || 0);

            if (item.currentStage) {
                stat.byStage[item.currentStage] = (stat.byStage[item.currentStage] || 0) + item._count.id;
            }
        });

        // 4. Merge and Calculate Metrics
        const campaignStats = spendData.map((item: any) => {
            const name = item.campaignName;
            const spend = Number(item._sum.spend || 0);
            const impressions = Number(item._sum.impressions || 0);
            const clicks = Number(item._sum.clicks || 0);

            const leadStat = leadsMap[name] || { count: 0, revenue: 0, byStage: {} };
            const leads = leadStat.count;
            const revenue = leadStat.revenue;

            const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
            const cpc = clicks > 0 ? spend / clicks : 0;
            const cpl = leads > 0 ? spend / leads : 0;
            const roas = spend > 0 ? revenue / spend : 0;

            return {
                id: `${name}-${item.platform}`, // composite key
                name,
                platform: item.platform,
                spend,
                impressions,
                clicks,
                leads,
                revenue,
                ctr,
                cpc,
                cpl,
                roas,
                breakdown: leadStat.byStage // Pass stage breakdown
            };
        });

        // Sorting (Default by Spend Desc)
        campaignStats.sort((a: any, b: any) => b.spend - a.spend);

        return NextResponse.json({
            stats: campaignStats,
            stages: stages // Return stage metadata for UI columns
        });

    } catch (error) {
        console.error("[ANALYTICS_CAMPAIGNS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
