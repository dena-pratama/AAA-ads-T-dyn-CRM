import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

        const body = await req.json()
        let { data, clientId } = body

        if (!data || !Array.isArray(data) || data.length === 0) {
            return new NextResponse("No data provided", { status: 400 })
        }

        // Resolve Client ID
        if (session.user.role === "SUPER_ADMIN") {
            if (!clientId) return new NextResponse("Client ID is required", { status: 400 })
        } else {
            if (clientId && clientId !== session.user.clientId) {
                return new NextResponse("Forbidden", { status: 403 })
            }
            clientId = session.user.clientId
            if (!clientId) return new NextResponse("User has no client", { status: 400 })
        }

        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

        let processedCount = 0;
        const batchId = new Date().toISOString(); // Simple batch ID

        for (const row of data) {
            // Fuzzy match keys
            const keys = Object.keys(row);
            const getValue = (patterns: string[]) => {
                const key = keys.find(k => patterns.some(p => normalize(k).includes(p)));
                return key ? row[key] : undefined;
            }

            const campaignName = getValue(["campaign", "name"]);
            if (!campaignName) continue; // Skip if no campaign name

            const spend = getValue(["spend", "cost", "amount", "biaya"]) || 0;
            const impressions = getValue(["impressions", "views", "max"]) || 0; // 'max' sometimes appearing in imports?
            const clicks = getValue(["clicks", "link"]) || 0;
            const leads = getValue(["leads", "result", "konversi"]) || 0;
            const platformRaw = getValue(["platform", "source", "publisher"]);

            // Date Parsing
            let dateVal = getValue(["date", "day", "time", "tanggal"]);
            let dateObj = new Date();
            if (typeof dateVal === 'number') {
                // Excel serial date (approximate)
                dateObj = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
            } else if (dateVal) {
                dateObj = new Date(dateVal);
                if (isNaN(dateObj.getTime())) dateObj = new Date(); // Fallback
            }

            // Determine Platform Enum
            let platform = "OTHER";
            const pLower = String(platformRaw || "").toLowerCase();
            if (pLower.includes("meta") || pLower.includes("facebook") || pLower.includes("ig")) platform = "META";
            else if (pLower.includes("google") || pLower.includes("youtube")) platform = "GOOGLE";
            else if (pLower.includes("tiktok")) platform = "TIKTOK";
            else if (pLower.includes("shopee")) platform = "SHOPEE";
            else if (pLower.includes("tokopedia")) platform = "TOKOPEDIA";

            // Upsert Campaign
            let campaign = await prisma.campaign.findFirst({
                where: { clientId, originalName: campaignName }
            });

            if (!campaign) {
                campaign = await prisma.campaign.create({
                    data: {
                        clientId,
                        name: campaignName,
                        originalName: campaignName,
                        platform: platform as any,
                        isActive: true
                    }
                });
            }

            // Create AdSpendLog
            await prisma.adSpendLog.create({
                data: {
                    clientId,
                    campaignId: campaign.id,
                    importBatchId: batchId,
                    date: dateObj,
                    platform: platform as any,
                    campaignName: campaignName,
                    spend: Number(spend) || 0,
                    impressions: Number(impressions) || 0,
                    clicks: Number(clicks) || 0,
                    // leads is not on AdSpendLog model in my memory? 
                    // Let's check schema.prisma
                    // AdSpendLog has: spend, impressions, clicks, reach, ctr, cpc, cpm.
                    // Leads are technically in LEAD table, but some ad reports have 'Results' (Leads).
                    // Does AdSpendLog have 'leads'?
                    // Schema check: Step 4197 lines 183-221. 
                    // spend, impressions, clicks, reach. NO LEADS column in AdSpendLog.
                    // Wait, so where do aggregated leads go?
                    // Leads usually come from CRM.
                    // IF the import contains "Results", should we store it?
                    // Maybe AdSpendLog should have 'leads' (platform reported leads)?
                    // Or we just ignore it for now.
                    // I will ignore for now to avoid schema change unless requested.
                    // But usually marketers want to compare Platform Leads vs CRM Leads.
                    // I'll stick to existing schema.
                    reach: Number(getValue(["reach", "jangkauan"])) || 0,
                    rawData: row as any
                }
            });

            processedCount++;
        }

        return NextResponse.json({ count: processedCount, batchId });
    } catch (error) {
        console.error("IMPORT ERROR:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
