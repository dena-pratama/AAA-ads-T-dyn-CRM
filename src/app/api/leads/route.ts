
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const leadSchema = z.object({
    customerName: z.string().min(1, "Name is required"),
    phone: z.string().min(1, "Phone is required"),
    email: z.string().email().optional().or(z.literal("")),
    pipelineId: z.string().min(1, "Pipeline is required"),
    stageId: z.string().min(1, "Stage is required"),
    source: z.string().optional(),
    csNumber: z.string().optional(),
})

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

        const { searchParams } = new URL(req.url)
        const pipelineId = searchParams.get("pipelineId")
        const stageId = searchParams.get("stageId")
        const search = searchParams.get("search")
        const dateFrom = searchParams.get("dateFrom")
        const dateTo = searchParams.get("dateTo")

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const whereClause: any = {}

        // Client Scoping
        if (session.user.role !== "SUPER_ADMIN") {
            whereClause.clientId = session.user.clientId || undefined
        }

        // Pipeline Filter
        if (pipelineId) {
            whereClause.pipelineId = pipelineId
        }

        // Stage Filter
        if (stageId) {
            whereClause.currentStage = stageId
        }

        // Search by name or phone
        if (search) {
            whereClause.OR = [
                { customerName: { contains: search, mode: "insensitive" } },
                { phone: { contains: search } }
            ]
        }

        // Date Range Filter
        if (dateFrom || dateTo) {
            whereClause.createdAt = {}
            if (dateFrom) whereClause.createdAt.gte = new Date(dateFrom)
            if (dateTo) {
                const endDate = new Date(dateTo)
                endDate.setHours(23, 59, 59, 999)
                whereClause.createdAt.lte = endDate
            }
        }

        const leads = await prisma.lead.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                pipeline: {
                    select: { name: true, stages: true }
                },
                campaign: {
                    select: { name: true }
                }
            },
            take: 500 // Increased for filtered views
        })

        // Map stage name from pipeline.stages JSON
        const mappedLeads = leads.map((lead: typeof leads[number]) => {
            const stages = (lead.pipeline?.stages as { id: string; name: string }[]) || []
            const stage = stages.find(s => s.id === lead.currentStage)
            return {
                ...lead,
                stage: stage ? { name: stage.name } : null,
                stageId: lead.currentStage // Expose for edit form
            }
        })

        return NextResponse.json(mappedLeads)
    } catch (error) {
        console.error("GET Leads Error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

        // Ensure client context
        const clientId = session.user.clientId; // Or strictly require it
        if (!clientId && session.user.role !== 'SUPER_ADMIN') {
            return new NextResponse("Client Context Missing", { status: 400 })
        }

        const body = await req.json()
        const validation = leadSchema.safeParse(body)

        if (!validation.success) {
            return new NextResponse(validation.error.message, { status: 400 })
        }

        const { customerName, phone, email, pipelineId, stageId, source, csNumber } = validation.data

        // Get clientId - use session.user.clientId or fetch from pipeline for SUPER_ADMIN
        let resolvedClientId = session.user.clientId

        if (!resolvedClientId) {
            // For SUPER_ADMIN without clientId, get it from the selected pipeline
            const pipeline = await prisma.pipeline.findUnique({
                where: { id: pipelineId },
                select: { clientId: true }
            })
            if (!pipeline) {
                return new NextResponse("Pipeline not found", { status: 404 })
            }
            resolvedClientId = pipeline.clientId
        }

        // Create Lead
        const lead = await prisma.lead.create({
            data: {
                customerName,
                phone,
                email: email || undefined,
                pipelineId,
                currentStage: stageId,
                campaignName: source || "Manual Entry",
                csNumber: csNumber || undefined,
                clientId: resolvedClientId!,
                createdById: session.user.id,
                status: "ACTIVE"
            }
        })

        return NextResponse.json(lead)

    } catch (error) {
        console.error("CREATE Lead Error:", error)
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        return new NextResponse(`Internal Server Error: ${errorMessage}`, { status: 500 })
    }
}
