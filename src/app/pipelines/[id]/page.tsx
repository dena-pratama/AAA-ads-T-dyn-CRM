
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PipelineForm } from "@/components/pipelines/pipeline-form"
import { pipelineSchema } from "@/lib/validators/pipeline"

export default async function EditPipelinePage({ params }: { params: { id: string } }) {
    const session = await auth()
    if (!session?.user) redirect("/login")

    // Retrieve pipeline
    const pipeline = await prisma.pipeline.findUnique({
        where: { id: params.id }
    })

    if (!pipeline) {
        return <div className="p-8">Pipeline not found.</div>
    }

    // Security check
    if (session.user.role !== "SUPER_ADMIN" && pipeline.clientId !== session.user.clientId) {
        return <div className="p-8 text-red-500">Forbidden.</div>
    }

    let clients = []
    if (session.user.role === "SUPER_ADMIN") {
        clients = await prisma.client.findMany({ select: { id: true, name: true } })
    }

    // Cast JSON to expected type safely
    const formattedData = {
        ...pipeline,
        stages: pipeline.stages as any,
        customFields: pipeline.customFields as any,
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PipelineForm
                initialData={formattedData}
                isSuperAdmin={session.user.role === "SUPER_ADMIN"}
                clients={clients}
            />
        </div>
    )
}
