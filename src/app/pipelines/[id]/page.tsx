
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PipelineDetailTabs } from "@/components/pipelines/pipeline-detail-tabs"
import { pipelineSchema } from "@/lib/validators/pipeline"
import { z } from "zod"

export default async function EditPipelinePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user) redirect("/login")

    const { id } = await params

    // Retrieve pipeline
    const pipeline = await prisma.pipeline.findUnique({
        where: { id }
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
    const formattedData: z.infer<typeof pipelineSchema> & { id: string } = {
        ...pipeline,
        stages: pipeline.stages as unknown as z.infer<typeof pipelineSchema>["stages"],
        customFields: pipeline.customFields as unknown as z.infer<typeof pipelineSchema>["customFields"],
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PipelineDetailTabs
                pipeline={formattedData}
                isSuperAdmin={session.user.role === "SUPER_ADMIN"}
                readOnly={session.user.role !== "SUPER_ADMIN"}
                clients={clients}
            />
        </div>
    )
}
