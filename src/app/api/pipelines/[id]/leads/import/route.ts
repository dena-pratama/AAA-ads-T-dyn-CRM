import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { Prisma } from "@prisma/client"

// Schema for individual lead
const importLeadSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().optional(),
    phone: z.string().optional(),
    value: z.coerce.number().optional(), // Coerce in case it comes as string
    company: z.string().optional(),
    notes: z.string().optional(),
    // Allow any other fields for custom mapping
}).passthrough()

const bulkImportSchema = z.object({
    leads: z.array(importLeadSchema).min(1, "At least one lead is required"),
})

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { id: pipelineId } = await context.params

        // Verify Pipeline Access
        const pipeline = await prisma.pipeline.findUnique({
            where: { id: pipelineId },
            include: { stages: true }
        })

        if (!pipeline) {
            return new NextResponse("Pipeline not found", { status: 404 })
        }

        // Check permissions (SuperAdmin or ClientAdmin for this Client)
        if (session.user.role !== "SUPER_ADMIN") {
            if (pipeline.clientId !== session.user.clientId) {
                return new NextResponse("Forbidden", { status: 403 })
            }
        }

        // Find the first stage to insert leads into
        // Convention: First stage in the list? Or "Lead" stage?
        // Let's assume the first stage in the array order is the entry point.
        // Prisma JSON arrays are not guaranteed order, but typically we store them ordered.
        // For now, let's look for a stage named "New" or "Lead", or fallback to the first one defined in JSON.
        // Actually, stages are stored as JSONB. We need to parse it.
        const stages = pipeline.stages as unknown as any[];
        let entryStageId = "";

        if (stages && Array.isArray(stages) && stages.length > 0) {
            entryStageId = stages[0].id; // Default to first stage
        } else {
            return new NextResponse("Pipeline has no stages to import into", { status: 400 })
        }

        const body = await req.json()
        const validation = bulkImportSchema.safeParse(body)
        if (!validation.success) {
            return new NextResponse(JSON.stringify(validation.error.issues), { status: 400 })
        }

        const { leads } = validation.data

        // Bulk Create using Transaction (Array of promises)
        // This is robust and type-safe
        const createPromises = leads.map(lead => {
            const { name, email, phone, value, notes, company, ...customData } = lead as Record<string, any>;
            const leadData = { ...customData, company };

            return prisma.lead.create({
                data: {
                    name,
                    email: email || null,
                    phone: phone || null,
                    value: value || 0,
                    notes: notes || null,
                    pipelineId: pipelineId,
                    stageId: entryStageId,
                    clientId: pipeline.clientId,
                    data: leadData as Prisma.InputJsonValue
                }
            })
        });

        const results = await prisma.$transaction(createPromises);

        return NextResponse.json({
            success: true,
            count: results.length,
            message: `Successfully imported ${results.length} leads`
        })

    } catch (error) {
        console.error("IMPORT_ERROR", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
