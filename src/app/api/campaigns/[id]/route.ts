import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const updateSchema = z.object({
    name: z.string().min(1).optional(),
    isActive: z.boolean().optional(),
    aliases: z.array(z.string()).optional(),
})

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth()
        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

        const { id } = await params

        const campaign = await prisma.campaign.findUnique({
            where: { id },
            include: {
                client: { select: { name: true } },
                _count: {
                    select: { spendLogs: true, leads: true }
                }
            }
        })

        if (!campaign) {
            return new NextResponse("Not Found", { status: 404 })
        }

        // Access check
        if (session.user.role !== "SUPER_ADMIN" && campaign.clientId !== session.user.clientId) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        return NextResponse.json(campaign)
    } catch (error) {
        console.error("GET Campaign Error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth()
        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

        const { id } = await params

        // Check ownership
        const existing = await prisma.campaign.findUnique({
            where: { id },
            select: { clientId: true }
        })

        if (!existing) {
            return new NextResponse("Not Found", { status: 404 })
        }

        if (session.user.role !== "SUPER_ADMIN" && existing.clientId !== session.user.clientId) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const body = await req.json()
        const validData = updateSchema.parse(body)

        const campaign = await prisma.campaign.update({
            where: { id },
            data: validData
        })

        return NextResponse.json(campaign)
    } catch (error) {
        console.error("PUT Campaign Error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth()
        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

        const { id } = await params

        // Check ownership
        const existing = await prisma.campaign.findUnique({
            where: { id },
            select: { clientId: true }
        })

        if (!existing) {
            return new NextResponse("Not Found", { status: 404 })
        }

        if (session.user.role !== "SUPER_ADMIN" && existing.clientId !== session.user.clientId) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        await prisma.campaign.delete({
            where: { id }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("DELETE Campaign Error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
