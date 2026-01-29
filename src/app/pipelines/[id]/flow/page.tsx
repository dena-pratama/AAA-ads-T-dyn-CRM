import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PipelineFlow } from "@/components/pipelines/pipeline-flow"

export default async function PipelineFlowPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user) redirect("/login")

    const { id } = await params

    const pipeline = await prisma.pipeline.findUnique({
        where: { id },
        select: {
            name: true,
            stages: true,
            clientId: true
        }
    })

    if (!pipeline) {
        return <div>Pipeline not found</div>
    }

    // Security check
    if (session.user.role !== "SUPER_ADMIN" && pipeline.clientId !== session.user.clientId) {
        return <div>Forbidden</div>
    }

    // Parse stages safely
    const stages = (pipeline.stages as any) || []

    return (
        <PipelineFlow pipelineName={pipeline.name} stages={stages} />
    )
}
