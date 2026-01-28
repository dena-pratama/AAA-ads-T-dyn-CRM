
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PipelinesClient } from "./pipelines-client"

export default async function PipelinesPage() {
    const session = await auth()
    if (!session?.user) redirect("/login")

    // Reuse the GET logic or fetch directly
    let whereClause: any = {}

    if (session.user.role === "SUPER_ADMIN") {
        // Show all
    } else {
        if (!session.user.clientId) {
            return <div>Error: User has no client</div>
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

    const formattedPipelines = pipelines.map(p => ({
        ...p,
        createdAt: p.createdAt.toISOString()
    }))

    const canManage = session.user.role === "SUPER_ADMIN"

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PipelinesClient data={formattedPipelines} canManage={canManage} />
        </div>
    )
}
