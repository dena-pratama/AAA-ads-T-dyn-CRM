"use client";

import { PipelineForm } from "@/components/pipelines/pipeline-form";

import { pipelineSchema } from "@/lib/validators/pipeline";
import { z } from "zod";

type PipelineData = z.infer<typeof pipelineSchema> & { id: string };

interface PipelineDetailTabsProps {
    pipeline: PipelineData;
    clients: { id: string; name: string }[];
    isSuperAdmin: boolean;
    readOnly: boolean;
}

export function PipelineDetailTabs({ pipeline, clients, isSuperAdmin, readOnly }: PipelineDetailTabsProps) {
    return (
        <div className="space-y-6">
            <PipelineForm
                initialData={pipeline}
                clients={clients}
                isSuperAdmin={isSuperAdmin}
                readOnly={readOnly}
            />
        </div>
    );
}

