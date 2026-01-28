
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import * as z from "zod"
import { pipelineSchema } from "@/lib/validators/pipeline"

// Schema for creation (clientId is handled server-side for non-superadmin)
const createPipelineSchema = pipelineSchema.omit({ clientId: true }).extend({
    clientId: z.string().optional() // Optional in body, but logic enforces it
})

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const clientIdParam = searchParams.get("clientId")

        // Logic:
        // SuperAdmin can see all, or filter by clientId
        // ClientAdmin/CS can ONLY see their own client's pipelines

        let whereClause: any = {}

        if (session.user.role === "SUPER_ADMIN") {
            if (clientIdParam) {
                whereClause.clientId = clientIdParam
            }
        } else {
            // Enforce client scope
            if (!session.user.clientId) {
                return new NextResponse("User has no client assigned", { status: 403 })
            }
            whereClause.clientId = session.user.clientId
        }

        const pipelines = await prisma.pipeline.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                client: {
                    select: { name: true }
                }
            }
        })

        return NextResponse.json(pipelines)
    } catch (error) {
        console.error("[PIPELINES_GET]", error)
        return new NextResponse("Internal error", { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Only Admin roles can create pipelines
        if (session.user.role === "CS") {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const body = await req.json()
        const validData = createPipelineSchema.parse(body)

        // Determine effective Client ID
        let targetClientId = session.user.clientId

        if (session.user.role === "SUPER_ADMIN") {
            // SuperAdmin can specify clientId in body, otherwise fallback to their own (unlikely but safe)
            if (body.clientId) {
                targetClientId = body.clientId
            }
        }

        if (!targetClientId) {
            return new NextResponse("Client ID is required", { status: 400 })
        }

        // Parse JSON fields to ensure they are valid objects (Prisma expects valid types for Json)
        // Zod validation above already checked structure, but we cast to InputJsonValue type automatically

        const pipeline = await prisma.pipeline.create({
            data: {
                name: validData.name,
                description: validData.description,
                isDefault: validData.isDefault,
                isActive: validData.isActive,
                stages: validData.stages as any, // Cast to any to satisfy Prisma Json type
                customFields: validData.customFields as any,
                clientId: targetClientId,
            }
        })

        return NextResponse.json(pipeline)

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.errors), { status: 400 })
        }
        console.error("[PIPELINES_POST]", error)
        return new NextResponse("Internal error", { status: 500 })
    }
}
