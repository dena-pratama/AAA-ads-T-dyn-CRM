
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { LeadsClient } from "./leads-client"

export default async function LeadsPage() {
    const session = await auth()
    if (!session?.user) redirect("/login")

    // Fetch pipelines for the import selector
    const whereClause: { clientId?: string } = {}
    if (session.user.role !== "SUPER_ADMIN" && session.user.clientId) {
        whereClause.clientId = session.user.clientId
    }

    const pipelines = await prisma.pipeline.findMany({
        where: whereClause,
        select: { id: true, name: true, stages: true }
    })

    // Cast stages to proper type for client component
    const typedPipelines = pipelines.map(p => ({
        ...p,
        stages: (p.stages || []) as { id: string; name: string; color: string }[]
    }));

    return <LeadsClient pipelines={typedPipelines} />
}
