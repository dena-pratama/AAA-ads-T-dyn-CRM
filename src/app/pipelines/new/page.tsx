
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PipelineForm } from "@/components/pipelines/pipeline-form"

export default async function NewPipelinePage() {
    const session = await auth()
    if (!session?.user) redirect("/login")

    // Check permission: CS cannot create pipelines
    if (session.user.role === "CS") {
        return <div className="p-8 text-red-500">You do not have permission to create pipelines.</div>
    }

    let clients = []

    // If SuperAdmin, fetch clients to allow assignment
    if (session.user.role === "SUPER_ADMIN") {
        clients = await prisma.client.findMany({ select: { id: true, name: true } })
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PipelineForm
                isSuperAdmin={session.user.role === "SUPER_ADMIN"}
                clients={clients}
            />
        </div>
    )
}
