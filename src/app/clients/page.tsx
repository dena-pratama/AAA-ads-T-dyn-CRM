import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClientsClient } from "./clients-client";

export const metadata: Metadata = {
    title: "Client Management - Asoy Analytics Ads",
};

async function getClients() {
    const clients = await prisma.client.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: {
                    users: true,
                    campaigns: true,
                    pipelines: true
                }
            }
        }
    });

    // Serialize dates for client components if needed
    // Using simple mapping to ensure types match
    return clients.map((client) => ({
        ...client,
        createdAt: client.createdAt.toISOString(),
        updatedAt: client.updatedAt.toISOString(),
        // Handle optional/nullable fields explicitly if needed by UI types
        description: client.description || null,
    }));
}

export default async function ClientsPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const clients = await getClients();

    const canManage = user.role === "SUPER_ADMIN";

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <Header user={user} />

            <main className="container mx-auto px-6 py-8">
                <ClientsClient data={clients} canManage={canManage} />
            </main>
        </div>
    );
}
