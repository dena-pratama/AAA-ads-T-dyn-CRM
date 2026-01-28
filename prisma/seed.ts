import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Prisma 7 requires the client to be constructed with the database URL
const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
});

// Enums - defined inline since Prisma 7 exports them differently
const UserRole = {
    SUPER_ADMIN: "SUPER_ADMIN",
    CLIENT_ADMIN: "CLIENT_ADMIN",
    CS: "CS",
} as const;

const AdPlatform = {
    META: "META",
    GOOGLE: "GOOGLE",
    TIKTOK: "TIKTOK",
    SHOPEE: "SHOPEE",
    TOKOPEDIA: "TOKOPEDIA",
    LAZADA: "LAZADA",
    OTHER: "OTHER",
} as const;

async function main() {
    console.log("🌱 Starting seed...");

    // Create Super Admin
    const hashedPassword = await bcrypt.hash("Admin@123", 12);

    const superAdmin = await prisma.user.upsert({
        where: { email: "admin@antigravity.io" },
        update: {},
        create: {
            email: "admin@antigravity.io",
            password: hashedPassword,
            name: "Super Admin",
            role: UserRole.SUPER_ADMIN,
            isActive: true,
        },
    });
    console.log("✅ Created Super Admin:", superAdmin.email);

    // Create Demo Client
    const demoClient = await prisma.client.upsert({
        where: { slug: "demo-maklon" },
        update: {},
        create: {
            name: "Demo Maklon Co.",
            slug: "demo-maklon",
            currency: "IDR",
            description: "Demo client for Maklon business model",
            isActive: true,
            settings: {
                timezone: "Asia/Jakarta",
                dateFormat: "DD/MM/YYYY",
            },
        },
    });
    console.log("✅ Created Demo Client:", demoClient.name);

    // Create Client Admin
    const clientAdmin = await prisma.user.upsert({
        where: { email: "client@demo.com" },
        update: {},
        create: {
            email: "client@demo.com",
            password: hashedPassword,
            name: "Client Admin",
            role: UserRole.CLIENT_ADMIN,
            clientId: demoClient.id,
            isActive: true,
        },
    });
    console.log("✅ Created Client Admin:", clientAdmin.email);

    // Create CS User
    const csUser = await prisma.user.upsert({
        where: { email: "cs@demo.com" },
        update: {},
        create: {
            email: "cs@demo.com",
            password: hashedPassword,
            name: "Customer Service",
            role: UserRole.CS,
            clientId: demoClient.id,
            isActive: true,
        },
    });
    console.log("✅ Created CS User:", csUser.email);

    // Create Default Pipeline (Maklon Model)
    const maklonPipeline = await prisma.pipeline.upsert({
        where: {
            clientId_name: {
                clientId: demoClient.id,
                name: "Maklon Pipeline"
            }
        },
        update: {},
        create: {
            clientId: demoClient.id,
            name: "Maklon Pipeline",
            description: "Standard pipeline for Maklon business: Lead → Sample → PO → Production",
            isDefault: true,
            isActive: true,
            stages: [
                { id: "stage_1", name: "New Lead", color: "#6B7280", order: 1, isGoal: false },
                { id: "stage_2", name: "Minta Sample", color: "#3B82F6", order: 2, isGoal: false },
                { id: "stage_3", name: "Sample Sent", color: "#8B5CF6", order: 3, isGoal: false },
                { id: "stage_4", name: "Nego/Follow Up", color: "#F59E0B", order: 4, isGoal: false },
                { id: "stage_5", name: "PO Received", color: "#10B981", order: 5, isGoal: true },
                { id: "stage_6", name: "Production", color: "#06B6D4", order: 6, isGoal: false },
                { id: "stage_7", name: "Delivered", color: "#22C55E", order: 7, isGoal: false },
            ],
            customFields: [
                { id: "field_1", name: "Jenis Produk", type: "select", options: ["Skincare", "Bodycare", "Haircare", "Supplement"], required: true },
                { id: "field_2", name: "Estimasi MOQ", type: "number", required: false },
                { id: "field_3", name: "Kota", type: "text", required: true },
                { id: "field_4", name: "Sumber Info", type: "select", options: ["Instagram", "Facebook", "Website", "Referral", "Lainnya"], required: false },
            ],
        },
    });
    console.log("✅ Created Pipeline:", maklonPipeline.name);

    // Create Demo Campaigns
    const campaigns = [
        { name: "Maklon Skincare Jan 2026", platform: AdPlatform.META },
        { name: "Maklon Bodycare Promo", platform: AdPlatform.META },
        { name: "Brand Awareness Q1", platform: AdPlatform.GOOGLE },
        { name: "TikTok Lead Gen", platform: AdPlatform.TIKTOK },
    ];

    for (const camp of campaigns) {
        await prisma.campaign.upsert({
            where: {
                clientId_originalName: {
                    clientId: demoClient.id,
                    originalName: camp.name,
                },
            },
            update: {},
            create: {
                clientId: demoClient.id,
                name: camp.name,
                originalName: camp.name,
                platform: camp.platform,
                isActive: true,
            },
        });
    }
    console.log("✅ Created", campaigns.length, "demo campaigns");

    // Create sample Ad Spend data
    const today = new Date();
    const spendData = [];

    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        for (const camp of campaigns) {
            spendData.push({
                clientId: demoClient.id,
                date: date,
                platform: camp.platform,
                campaignName: camp.name,
                spend: Math.floor(Math.random() * 500000) + 100000, // 100k - 600k
                impressions: Math.floor(Math.random() * 50000) + 10000,
                clicks: Math.floor(Math.random() * 1000) + 100,
                reach: Math.floor(Math.random() * 30000) + 5000,
            });
        }
    }

    await prisma.adSpendLog.createMany({
        data: spendData,
        skipDuplicates: true,
    });
    console.log("✅ Created", spendData.length, "ad spend records");

    // Create sample Leads
    const sampleLeads = [
        { name: "Andi Wijaya", phone: "081234567890", stage: "stage_2" },
        { name: "Budi Santoso", phone: "081234567891", stage: "stage_3" },
        { name: "Citra Dewi", phone: "081234567892", stage: "stage_4" },
        { name: "Dian Permata", phone: "081234567893", stage: "stage_5" },
        { name: "Eka Putri", phone: "081234567894", stage: "stage_1" },
    ];

    const campaignForLeads = await prisma.campaign.findFirst({
        where: { clientId: demoClient.id },
    });

    for (const lead of sampleLeads) {
        await prisma.lead.create({
            data: {
                clientId: demoClient.id,
                customerName: lead.name,
                phone: lead.phone,
                campaignId: campaignForLeads?.id,
                campaignName: campaignForLeads?.name || "Unknown",
                pipelineId: maklonPipeline.id,
                currentStage: lead.stage,
                customData: {
                    "Jenis Produk": "Skincare",
                    "Kota": "Jakarta",
                },
                createdById: csUser.id,
            },
        });
    }
    console.log("✅ Created", sampleLeads.length, "sample leads");

    console.log("\n🎉 Seed completed successfully!");
    console.log("\n📝 Login credentials:");
    console.log("   Super Admin: admin@antigravity.io / Admin@123");
    console.log("   Client Admin: client@demo.com / Admin@123");
    console.log("   CS: cs@demo.com / Admin@123");
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
