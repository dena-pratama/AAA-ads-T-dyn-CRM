import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { AnalyticsClient } from "./analytics-client";

interface PageProps {
    params: Promise<{ clientId: string }>;
}

export default async function AnalyticsPage({ params }: PageProps) {
    const { clientId } = await params;
    const user = await getCurrentUser();

    if (!user) {
        redirect("/auth/signin");
    }

    // Access control
    if (user.role !== "SUPER_ADMIN" && user.clientId !== clientId) {
        redirect("/dashboard");
    }

    // Get client info
    const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: {
            id: true,
            name: true,
            logo: true,
            currency: true,
        },
    });

    if (!client) {
        notFound();
    }

    // Get all clients for Super Admin switcher
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let clients: any[] = [];
    if (user.role === "SUPER_ADMIN") {
        clients = await prisma.client.findMany({
            select: {
                id: true,
                name: true,
                logo: true,
                currency: true,
            },
            orderBy: { name: "asc" }
        });
    }

    return (
        <AnalyticsClient
            client={client}
            clients={clients}
            isSuperAdmin={user.role === "SUPER_ADMIN"}
        />
    );
}
