
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { pipelineSchema } from "@/lib/validators/pipeline"
import * as z from "zod"

// Update schema can be partial
const updatePipelineSchema = pipelineSchema.partial().omit({ clientId: true })

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const pipeline = await prisma.pipeline.findUnique({
            where: { id: params.id },
            include: {
                client: { select: { name: true } }
            }
        })

        if (!pipeline) {
            return new NextResponse("Pipeline not found", { status: 404 })
        }

        // Security Check
        if (session.user.role !== "SUPER_ADMIN" && pipeline.clientId !== session.user.clientId) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        return NextResponse.json(pipeline)
    } catch (error) {
        console.error("[PIPELINE_GET]", error)
        return new NextResponse("Internal error", { status: 500 })
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // CS cannot update pipelines
        if (session.user.role === "CS") {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const body = await req.json()
        const validData = updatePipelineSchema.parse(body)

        // Verify ownership before update
        const existingPipeline = await prisma.pipeline.findUnique({
            where: { id: params.id }
        })

        if (!existingPipeline) {
            return new NextResponse("Not found", { status: 404 })
        }

        if (session.user.role !== "SUPER_ADMIN" && existingPipeline.clientId !== session.user.clientId) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const updatedPipeline = await prisma.pipeline.update({
            where: { id: params.id },
            data: {
                name: validData.name,
                description: validData.description,
                isDefault: validData.isDefault,
                isActive: validData.isActive,
                stages: validData.stages ? (validData.stages as any) : undefined,
                customFields: validData.customFields ? (validData.customFields as any) : undefined,
            }
        })

        return NextResponse.json(updatedPipeline)

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.errors), { status: 400 })
        }
        console.error("[PIPELINE_PUT]", error)
        return new NextResponse("Internal error", { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (session.user.role === "CS") {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const existingPipeline = await prisma.pipeline.findUnique({
            where: { id: params.id }
        })

        if (!existingPipeline) {
            return new NextResponse("Not found", { status: 404 })
        }

        if (session.user.role !== "SUPER_ADMIN" && existingPipeline.clientId !== session.user.clientId) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        await prisma.pipeline.delete({
            where: { id: params.id }
        })

        return new NextResponse(null, { status: 204 })

    } catch (error) {
        console.error("[PIPELINE_DELETE]", error)
        return new NextResponse("Internal error", { status: 500 })
    }
}
