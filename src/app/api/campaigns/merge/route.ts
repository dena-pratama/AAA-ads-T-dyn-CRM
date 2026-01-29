import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const mergeSchema = z.object({
    targetId: z.string().min(1),
    sourceIds: z.array(z.string().min(1)).min(1),
})

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

        const body = await req.json()
        const { targetId, sourceIds } = mergeSchema.parse(body)

        // Get target campaign
        const target = await prisma.campaign.findUnique({
            where: { id: targetId }
        })

        if (!target) {
            return new NextResponse("Target campaign not found", { status: 404 })
        }

        // Access check
        if (session.user.role !== "SUPER_ADMIN" && target.clientId !== session.user.clientId) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        // Get source campaigns
        const sources = await prisma.campaign.findMany({
            where: { id: { in: sourceIds } }
        })

        // Collect all aliases from sources
        const newAliases = sources.flatMap((s: { originalName: string; aliases: string[] }) => [s.originalName, ...s.aliases])

        // Transaction: update target, move relations, delete sources
        await prisma.$transaction(async (tx) => {
            // Update target with new aliases
            await tx.campaign.update({
                where: { id: targetId },
                data: {
                    aliases: {
                        push: newAliases
                    }
                }
            })

            // Move AdSpendLogs to target
            await tx.adSpendLog.updateMany({
                where: { campaignId: { in: sourceIds } },
                data: { campaignId: targetId }
            })

            // Move Leads to target
            await tx.lead.updateMany({
                where: { campaignId: { in: sourceIds } },
                data: { campaignId: targetId }
            })

            // Delete source campaigns
            await tx.campaign.deleteMany({
                where: { id: { in: sourceIds } }
            })
        })

        // Return updated target
        const updated = await prisma.campaign.findUnique({
            where: { id: targetId },
            include: {
                _count: { select: { spendLogs: true, leads: true } }
            }
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error("MERGE Campaigns Error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
