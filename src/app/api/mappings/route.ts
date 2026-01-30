import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { z } from "zod";

const createMappingSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    platform: z.enum(["META", "GOOGLE", "TIKTOK", "SHOPEE", "TOKOPEDIA", "LAZADA", "OTHER"]),
    columnMappings: z.record(z.string(), z.string()),
    transformations: z.record(z.string(), z.any()).optional(),
    isDefault: z.boolean().optional(),
    clientId: z.string().optional(), // For SuperAdmin to specify client
});

// Platform-specific default mappings
const PLATFORM_DEFAULTS: Record<string, Record<string, string>> = {
    META: {
        "Date": "date",
        "Campaign name": "campaignName",
        "Amount spent (IDR)": "spend",
        "Impressions": "impressions",
        "Link clicks": "clicks",
        "Reach": "reach",
    },
    GOOGLE: {
        "Day": "date",
        "Campaign": "campaignName",
        "Cost": "spend",
        "Impr.": "impressions",
        "Clicks": "clicks",
    },
    TIKTOK: {
        "Date": "date",
        "Campaign Name": "campaignName",
        "Cost": "spend",
        "Impression": "impressions",
        "Clicks": "clicks",
        "Reach": "reach",
    },
    SHOPEE: {
        "Date": "date",
        "Campaign Name": "campaignName",
        "Budget Spent": "spend",
        "Impressions": "impressions",
        "Clicks": "clicks",
    },
};

// Auto-detect column mappings based on column names
function autoDetectMappings(columns: string[]): Record<string, string> {
    const mappings: Record<string, string> = {};
    const patterns: Record<string, RegExp[]> = {
        date: [/date/i, /day/i, /tanggal/i, /period/i],
        campaignName: [/campaign/i, /kampanye/i, /ad\s*set/i, /nama/i],
        spend: [/spend/i, /cost/i, /amount/i, /biaya/i, /spent/i, /budget/i],
        impressions: [/impression/i, /impr/i, /views/i, /tayang/i],
        clicks: [/click/i, /klik/i],
        reach: [/reach/i, /jangkauan/i],
        ctr: [/ctr/i, /click.*rate/i],
        cpc: [/cpc/i, /cost.*click/i],
    };

    for (const col of columns) {
        for (const [field, regexes] of Object.entries(patterns)) {
            if (regexes.some((r) => r.test(col)) && !Object.values(mappings).includes(field)) {
                mappings[col] = field;
                break;
            }
        }
    }

    return mappings;
}

// GET /api/mappings - List saved mappings
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const platform = searchParams.get("platform");
        const autoDetect = searchParams.get("autoDetect");
        const columnsParam = searchParams.get("columns");

        // Auto-detect mode: return suggested mappings
        if (autoDetect === "true" && columnsParam) {
            const columns = columnsParam.split(",").map((c) => c.trim());
            const detected = autoDetectMappings(columns);

            // Get platform default if specified
            let platformDefault = {};
            if (platform && PLATFORM_DEFAULTS[platform]) {
                platformDefault = PLATFORM_DEFAULTS[platform];
            }

            return NextResponse.json({
                detected,
                platformDefault,
                merged: { ...platformDefault, ...detected },
            });
        }

        // Build where clause
        const where: Record<string, unknown> = {};

        if (user.role === "SUPER_ADMIN") {
            const clientId = searchParams.get("clientId");
            if (clientId) where.clientId = clientId;
        } else if (user.clientId) {
            where.clientId = user.clientId;
        } else {
            return NextResponse.json({ error: "No client access" }, { status: 403 });
        }

        if (platform) where.platform = platform;

        const mappings = await prisma.mappingConfig.findMany({
            where,
            include: {
                client: { select: { id: true, name: true } },
            },
            orderBy: [{ isDefault: "desc" }, { name: "asc" }],
        });

        // Also return platform defaults for reference
        return NextResponse.json({
            mappings,
            platformDefaults: PLATFORM_DEFAULTS,
        });
    } catch (error) {
        console.error("GET /api/mappings error:", error);
        return NextResponse.json(
            { error: "Failed to fetch mappings" },
            { status: 500 }
        );
    }
}

// POST /api/mappings - Save mapping
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validated = createMappingSchema.parse(body);

        // Determine client ID
        let clientId: string;
        if (user.role === "SUPER_ADMIN" && validated.clientId) {
            clientId = validated.clientId;
        } else if (user.clientId) {
            clientId = user.clientId;
        } else {
            return NextResponse.json({ error: "Client ID required" }, { status: 400 });
        }

        // If this is set as default, unset other defaults for same platform
        if (validated.isDefault) {
            await prisma.mappingConfig.updateMany({
                where: {
                    clientId,
                    platform: validated.platform,
                    isDefault: true,
                },
                data: { isDefault: false },
            });
        }

        const mapping = await prisma.mappingConfig.create({
            data: {
                clientId,
                name: validated.name,
                description: validated.description,
                platform: validated.platform,
                columnMappings: validated.columnMappings,
                transformations: validated.transformations || {},
                isDefault: validated.isDefault || false,
            },
            include: {
                client: { select: { id: true, name: true } },
            },
        });

        return NextResponse.json(mapping, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 }
            );
        }
        console.error("POST /api/mappings error:", error);
        return NextResponse.json(
            { error: "Failed to create mapping" },
            { status: 500 }
        );
    }
}
