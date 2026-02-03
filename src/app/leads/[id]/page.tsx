import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { LeadDetailClient } from "./lead-detail-client";

interface LeadDetailPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: LeadDetailPageProps): Promise<Metadata> {
    const { id } = await params;
    const lead = await prisma.lead.findUnique({
        where: { id },
        select: { customerName: true },
    });

    return {
        title: lead ? `${lead.customerName} - Lead Detail` : "Lead Detail",
    };
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const lead = await prisma.lead.findUnique({
        where: { id },
        include: {
            client: { select: { id: true, name: true } },
            pipeline: { select: { id: true, name: true, stages: true } },
            campaign: { select: { id: true, name: true } },
            createdBy: { select: { name: true, email: true } },
            updatedBy: { select: { name: true, email: true } },
            stageHistory: {
                orderBy: { movedAt: "desc" },
                take: 10,
            },
        },
    });

    if (!lead) {
        notFound();
    }

    // Access check
    if (user.role !== "SUPER_ADMIN" && lead.clientId !== user.clientId) {
        redirect("/leads");
    }

    // Convert Prisma types to client component compatible types
    const leadData = {
        ...lead,
        value: lead.value ? Number(lead.value) : null,
        leadDate: lead.leadDate.toISOString(),
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString(),
        customData: (lead.customData || {}) as Record<string, unknown>,
        pipeline: lead.pipeline ? {
            ...lead.pipeline,
            stages: lead.pipeline.stages as { id: string; name: string; color: string; order: number; isGoal?: boolean }[],
        } : null,
        stageHistory: lead.stageHistory.map(h => ({
            ...h,
            movedAt: h.movedAt.toISOString(),
        })),
    };

    return <LeadDetailClient lead={leadData} />;
}
