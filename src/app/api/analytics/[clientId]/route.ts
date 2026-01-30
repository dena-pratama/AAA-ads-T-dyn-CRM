import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

interface RouteParams {
    params: Promise<{ clientId: string }>;
}

// Platform metric presets
const METRIC_PRESETS = {
    META: [
        { id: "spend", label: "Total Ad Spent", formula: "sum:spend", format: "currency", visible: true, order: 1 },
        { id: "impressions", label: "Impressions", formula: "sum:impressions", format: "number", visible: true, order: 2 },
        { id: "clicks", label: "Clicks", formula: "sum:clicks", format: "number", visible: true, order: 3 },
        { id: "reach", label: "Reach", formula: "sum:reach", format: "number", visible: true, order: 4 },
        { id: "ctr", label: "CTR", formula: "clicks/impressions*100", format: "percent", visible: true, order: 5 },
        { id: "cpc", label: "CPC", formula: "spend/clicks", format: "currency", visible: true, order: 6 },
        { id: "cpm", label: "CPM", formula: "spend/impressions*1000", format: "currency", visible: true, order: 7 },
        { id: "leads", label: "Total Leads", formula: "count:leads", format: "number", visible: true, order: 8 },
        { id: "cpl", label: "Cost Per Lead", formula: "spend/leads", format: "currency", visible: true, order: 9 },
    ],
    GOOGLE: [
        { id: "spend", label: "Total Cost", formula: "sum:spend", format: "currency", visible: true, order: 1 },
        { id: "impressions", label: "Impressions", formula: "sum:impressions", format: "number", visible: true, order: 2 },
        { id: "clicks", label: "Clicks", formula: "sum:clicks", format: "number", visible: true, order: 3 },
        { id: "ctr", label: "CTR", formula: "clicks/impressions*100", format: "percent", visible: true, order: 4 },
        { id: "cpc", label: "CPC", formula: "spend/clicks", format: "currency", visible: true, order: 5 },
        { id: "conversions", label: "Conversions", formula: "count:conversions", format: "number", visible: true, order: 6 },
        { id: "roas", label: "ROAS", formula: "revenue/spend", format: "number", visible: true, order: 7 },
    ],
    TIKTOK: [
        { id: "spend", label: "Total Spend", formula: "sum:spend", format: "currency", visible: true, order: 1 },
        { id: "impressions", label: "Impressions", formula: "sum:impressions", format: "number", visible: true, order: 2 },
        { id: "clicks", label: "Clicks", formula: "sum:clicks", format: "number", visible: true, order: 3 },
        { id: "reach", label: "Reach", formula: "sum:reach", format: "number", visible: true, order: 4 },
        { id: "ctr", label: "CTR", formula: "clicks/impressions*100", format: "percent", visible: true, order: 5 },
        { id: "cpc", label: "CPC", formula: "spend/clicks", format: "currency", visible: true, order: 6 },
    ],
    CUSTOM: [
        { id: "spend", label: "Total Ad Spent", formula: "sum:spend", format: "currency", visible: true, order: 1 },
        { id: "leads", label: "Total Leads", formula: "count:leads", format: "number", visible: true, order: 2 },
        { id: "cpl", label: "Cost Per Lead", formula: "spend/leads", format: "currency", visible: true, order: 3 },
    ],
};

// GET /api/analytics/[clientId] - Get analytics data
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { clientId } = await params;
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Access control
        if (user.role !== "SUPER_ADMIN" && user.clientId !== clientId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const platform = searchParams.get("platform");

        // Get client info
        const client = await prisma.client.findUnique({
            where: { id: clientId },
            include: { dashboardConfig: true },
        });

        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        // Get dashboard config or create default
        let config = client.dashboardConfig;
        if (!config) {
            config = await prisma.dashboardConfig.create({
                data: {
                    clientId,
                    preset: "CUSTOM",
                    metrics: METRIC_PRESETS.CUSTOM,
                    charts: [
                        { id: "spend", type: "area", title: "Amount Spent", visible: true, order: 1 },
                        { id: "leads", type: "bar", title: "Potential Leads", visible: true, order: 2 },
                        { id: "qualified", type: "bar", title: "Leads Acquired", visible: true, order: 3 },
                        { id: "conversion", type: "bar", title: "Conversion to Sample", visible: true, order: 4 },
                    ],
                },
            });
        }

        // Build date filters
        const dateFilter: Record<string, unknown> = {};
        if (startDate) dateFilter.gte = new Date(startDate);
        if (endDate) dateFilter.lte = new Date(endDate);

        // Aggregate spend data
        const spendWhere: Record<string, unknown> = { clientId };
        if (Object.keys(dateFilter).length > 0) spendWhere.date = dateFilter;
        if (platform) spendWhere.platform = platform;

        const spendAgg = await prisma.adSpendLog.aggregate({
            where: spendWhere,
            _sum: {
                spend: true,
                impressions: true,
                clicks: true,
                reach: true,
            },
            _count: true,
        });

        // Count leads
        const leadsWhere: Record<string, unknown> = { clientId };
        if (Object.keys(dateFilter).length > 0) leadsWhere.leadDate = dateFilter;

        const leadsCount = await prisma.lead.count({ where: leadsWhere });

        // Get monthly data for charts
        const monthlySpend = await prisma.adSpendLog.groupBy({
            by: ["date"],
            where: spendWhere,
            _sum: { spend: true, impressions: true, clicks: true },
            orderBy: { date: "asc" },
        });

        // Process monthly data
        const monthlyData: Record<string, { spend: number; impressions: number; clicks: number }> = {};
        monthlySpend.forEach((item) => {
            const monthKey = new Date(item.date).toISOString().slice(0, 7);
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { spend: 0, impressions: 0, clicks: 0 };
            }
            monthlyData[monthKey].spend += item._sum.spend || 0;
            monthlyData[monthKey].impressions += item._sum.impressions || 0;
            monthlyData[monthKey].clicks += item._sum.clicks || 0;
        });

        // Monthly leads
        const monthlyLeads = await prisma.lead.groupBy({
            by: ["leadDate"],
            where: leadsWhere,
            _count: true,
            orderBy: { leadDate: "asc" },
        });

        const leadsData: Record<string, number> = {};
        monthlyLeads.forEach((item) => {
            if (item.leadDate) {
                const monthKey = new Date(item.leadDate).toISOString().slice(0, 7);
                leadsData[monthKey] = (leadsData[monthKey] || 0) + item._count;
            }
        });

        // Calculate metrics
        const totalSpend = spendAgg._sum.spend || 0;
        const totalImpressions = spendAgg._sum.impressions || 0;
        const totalClicks = spendAgg._sum.clicks || 0;
        const totalReach = spendAgg._sum.reach || 0;

        const metrics = {
            spend: totalSpend,
            impressions: totalImpressions,
            clicks: totalClicks,
            reach: totalReach,
            leads: leadsCount,
            ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
            cpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
            cpm: totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0,
            cpl: leadsCount > 0 ? totalSpend / leadsCount : 0,
        };

        return NextResponse.json({
            client: {
                id: client.id,
                name: client.name,
                logo: client.logo,
                currency: client.currency,
            },
            config,
            metrics,
            charts: {
                monthly: Object.entries(monthlyData).map(([month, data]) => ({
                    month,
                    ...data,
                    leads: leadsData[month] || 0,
                })),
            },
            presets: METRIC_PRESETS,
        });
    } catch (error) {
        console.error("GET /api/analytics/[clientId] error:", error);
        return NextResponse.json(
            { error: "Failed to fetch analytics" },
            { status: 500 }
        );
    }
}
