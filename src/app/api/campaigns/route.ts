import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const campaignUpdateSchema = z.object({
    name: z.string().min(1).optional(),
    isActive: z.boolean().optional(),
})

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

        const { searchParams } = new URL(req.url)
        const clientId = searchParams.get("clientId")

        // Build where clause
        const where: Record<string, unknown> = {}

        if (session.user.role !== "SUPER_ADMIN") {
            where.clientId = session.user.clientId
        } else if (clientId) {
            where.clientId = clientId
        }

        const campaigns = await prisma.campaign.findMany({
            where,
            include: {
                client: {
                    select: { name: true }
                },
                _count: {
                    select: {
                        spendLogs: true,
                        leads: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json(campaigns)
    } catch (error) {
        console.error("GET Campaigns Error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

        const body = await req.json()
        const { name, clientId, platform } = body

        if (!name || !clientId || !platform) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        // Check if campaign with same name exists
        const existing = await prisma.campaign.findFirst({
            where: { clientId, originalName: name }
        })

        if (existing) {
            return new NextResponse("Campaign with this name already exists", { status: 400 })
        }

        const campaign = await prisma.campaign.create({
            data: {
                name,
                originalName: name,
                platform,
                clientId,
                isActive: true
            }
        })

        return NextResponse.json(campaign)
    } catch (error) {
        console.error("POST Campaign Error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
