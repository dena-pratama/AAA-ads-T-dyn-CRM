
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
        const dateFilter: any = {};
        if (startDate && endDate) {
            dateFilter.date = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        // Platform filter
        const platformFilter: any = {};
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

        // 2. Get Leads Count per Campaign (Join via campaignName or campaignId if linked)
        // Since we group by campaignName from spend logs, we try to match leads by campaignName
        // Note: Ideally leads are linked to Campaign Model, but imported spend logs might just have raw names.
        // We will match by campaignName for simplicity of this view.

        // Fetch leads directly
        const leadFilter: any = {};
        if (startDate && endDate) {
            leadFilter.leadDate = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        const leadsData = await prisma.lead.groupBy({
            by: ["campaignName"],
            where: {
                clientId,
                ...leadFilter, // Leads date filter
                // If platform filter is on, we might need to filter leads by source too if available
                // But currently Lead model relies on campaignName to match.
            },
            _count: {
                id: true
            }
        });

        // Map leads to a dictionary for fast lookup
        const leadsMap: Record<string, number> = {};
        leadsData.forEach((item) => {
            if (item.campaignName) {
                leadsMap[item.campaignName] = item._count.id;
            }
        });

        // 3. Merge and Calculate Metrics
        const campaignStats = spendData.map((item) => {
            const name = item.campaignName;
            const spend = Number(item._sum.spend || 0);
            const impressions = Number(item._sum.impressions || 0);
            const clicks = Number(item._sum.clicks || 0);
            const leads = leadsMap[name] || 0;

            const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
            const cpc = clicks > 0 ? spend / clicks : 0;
            const cpl = leads > 0 ? spend / leads : 0;
            const roas = 0; // Placeholder until revenue is tracked

            return {
                id: `${name}-${item.platform}`, // composite key
                name,
                platform: item.platform,
                spend,
                impressions,
                clicks,
                leads,
                ctr,
                cpc,
                cpl,
                roas
            };
        });

        // Sorting (Default by Spend Desc)
        campaignStats.sort((a, b) => b.spend - a.spend);

        return NextResponse.json(campaignStats);

    } catch (error) {
        console.error("[ANALYTICS_CAMPAIGNS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
