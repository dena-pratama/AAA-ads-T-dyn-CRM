import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const stageUpdateSchema = z.object({
    stageId: z.string().min(1),
})

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth()
        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

        const { id } = await params
        const body = await req.json()
        const { stageId } = stageUpdateSchema.parse(body)

        // Get the lead to check ownership
        const lead = await prisma.lead.findUnique({
            where: { id },
            select: { clientId: true }
        })

        if (!lead) {
            return new NextResponse("Lead not found", { status: 404 })
        }

        // Access check
        if (session.user.role !== "SUPER_ADMIN" && lead.clientId !== session.user.clientId) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        // Update the lead's stage
        const updated = await prisma.lead.update({
            where: { id },
            data: { stageId },
            include: {
                stage: { select: { name: true } },
                pipeline: { select: { name: true } },
            }
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error("UPDATE Lead Stage Error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
