import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CampaignsClient } from "./campaigns-client"
import { prisma } from "@/lib/prisma"

export default async function CampaignsPage() {
    const session = await auth()
    if (!session?.user) redirect("/auth/login")

    // Build where clause
    const where: Record<string, unknown> = {}

    if (session.user.role !== "SUPER_ADMIN") {
        where.clientId = session.user.clientId
    }

    const campaigns = await prisma.campaign.findMany({
        where,
        include: {
            client: {
                select: { id: true, name: true }
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

    // Get clients for filter (SUPER_ADMIN only)
    const clients = session.user.role === "SUPER_ADMIN"
        ? await prisma.client.findMany({
            select: { id: true, name: true },
            orderBy: { name: "asc" }
        })
        : []

    const formattedCampaigns = campaigns.map((c: typeof campaigns[number]) => ({
        id: c.id,
        name: c.name,
        originalName: c.originalName,
        platform: c.platform,
        isActive: c.isActive,
        clientId: c.clientId,
        clientName: c.client.name,
        aliases: c.aliases,
        spendCount: c._count.spendLogs,
        leadCount: c._count.leads,
        createdAt: c.createdAt.toISOString(),
    }))

    return (
        <CampaignsClient
            data={formattedCampaigns}
            clients={clients}
            isSuperAdmin={session.user.role === "SUPER_ADMIN"}
        />
    )
}
