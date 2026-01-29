
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { LeadsClient } from "./leads-client"

export default async function LeadsPage() {
    const session = await auth()
    if (!session?.user) redirect("/login")

    // Fetch pipelines for the import selector
    let whereClause: any = {}
    if (session.user.role !== "SUPER_ADMIN") {
        whereClause.clientId = session.user.clientId
    }

    const pipelines = await prisma.pipeline.findMany({
        where: whereClause,
        select: { id: true, name: true }
    })

    const canManage = session.user.role === "SUPER_ADMIN" || session.user.role === "CLIENT_ADMIN"

    return <LeadsClient pipelines={pipelines} canManage={canManage} />
}
