
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const updateSchema = z.object({
    customerName: z.string().min(1).optional(),
    phone: z.string().min(1).optional(),
    email: z.string().email().optional().or(z.literal("")),
    pipelineId: z.string().min(1).optional(),
    stageId: z.string().min(1).optional(),
    source: z.string().optional(),
    csNumber: z.string().optional(),
})

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    const { id } = await params

    const lead = await prisma.lead.findUnique({
        where: { id },
    })

    if (!lead) {
        return new NextResponse("Not Found", { status: 404 })
    }

    // SUPER_ADMIN can access all, others only their client's leads
    if (session.user.role !== "SUPER_ADMIN" && lead.clientId !== session.user.clientId) {
        return new NextResponse("Not Found", { status: 404 })
    }

    return NextResponse.json(lead)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    const { id } = await params

    try {
        const body = await req.json()
        const validData = updateSchema.parse(body)

        // Verify ownership
        const existing = await prisma.lead.findUnique({
            where: { id },
            select: { clientId: true }
        })

        if (!existing) {
            return new NextResponse("Not Found", { status: 404 })
        }

        // SUPER_ADMIN can edit all, others only their client's leads
        if (session.user.role !== "SUPER_ADMIN" && existing.clientId !== session.user.clientId) {
            return new NextResponse("Not Found", { status: 404 })
        }

        // Map form fields to Prisma fields
        const updateData: Record<string, unknown> = {}
        if (validData.customerName) updateData.customerName = validData.customerName
        if (validData.phone) updateData.phone = validData.phone
        if (validData.email !== undefined) updateData.email = validData.email
        if (validData.pipelineId) updateData.pipelineId = validData.pipelineId
        if (validData.stageId) updateData.currentStage = validData.stageId
        if (validData.source) updateData.campaignName = validData.source
        if (validData.csNumber !== undefined) updateData.csNumber = validData.csNumber

        const lead = await prisma.lead.update({
            where: { id },
            data: updateData
        })

        return NextResponse.json(lead)
    } catch (error) {
        console.error("Lead Update Error:", error)
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        return new NextResponse(`Internal Error: ${errorMessage}`, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    const { id } = await params

    try {
        // Verify ownership
        const existing = await prisma.lead.findUnique({
            where: { id },
            select: { clientId: true }
        })

        if (!existing) {
            return new NextResponse("Not Found", { status: 404 })
        }

        // SUPER_ADMIN can delete all, others only their client's leads
        if (session.user.role !== "SUPER_ADMIN" && existing.clientId !== session.user.clientId) {
            return new NextResponse("Not Found", { status: 404 })
        }

        await prisma.lead.delete({
            where: { id }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("Lead Delete Error:", error)
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        return new NextResponse(`Internal Error: ${errorMessage}`, { status: 500 })
    }
}

