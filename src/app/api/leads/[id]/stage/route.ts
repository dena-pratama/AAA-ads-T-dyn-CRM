import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const stageUpdateSchema = z.object({
    stageId: z.string().min(1),
})

interface RouteParams {
    params: Promise<{ id: string }>;
}

// PUT /api/leads/[id]/stage - Update lead stage with history tracking
export async function PUT(req: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth()
        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

        const { id } = await params
        const body = await req.json()
        const { stageId } = stageUpdateSchema.parse(body)

        // Get the lead to check ownership
        const lead = await prisma.lead.findUnique({
            where: { id },
            select: { clientId: true, currentStage: true }
        })

        if (!lead) {
            return new NextResponse("Lead not found", { status: 404 })
        }

        // Access check
        if (session.user.role !== "SUPER_ADMIN" && lead.clientId !== session.user.clientId) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const previousStage = lead.currentStage

        // Update lead stage and create history entry in transaction
        const [updated] = await prisma.$transaction([
            prisma.lead.update({
                where: { id },
                data: {
                    currentStage: stageId,
                    updatedById: session.user.id,
                },
                include: {
                    pipeline: { select: { name: true, stages: true } },
                    campaign: { select: { name: true } },
                }
            }),
            prisma.leadStageHistory.create({
                data: {
                    leadId: id,
                    fromStage: previousStage,
                    toStage: stageId,
                    movedById: session.user.id,
                },
            }),
        ])

        return NextResponse.json(updated)
    } catch (error) {
        console.error("UPDATE Lead Stage Error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

// GET /api/leads/[id]/stage - Get stage history
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth()
        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

        const { id } = await params

        const lead = await prisma.lead.findUnique({
            where: { id },
            select: { clientId: true },
        })

        if (!lead) {
            return new NextResponse("Lead not found", { status: 404 })
        }

        if (session.user.role !== "SUPER_ADMIN" && lead.clientId !== session.user.clientId) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const history = await prisma.leadStageHistory.findMany({
            where: { leadId: id },
            orderBy: { movedAt: "desc" },
        })

        return NextResponse.json(history)
    } catch (error) {
        console.error("GET Stage History Error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
