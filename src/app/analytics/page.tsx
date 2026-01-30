import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function AnalyticsIndexPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/auth/signin");
    }

    // If regular user (CS/Client), redirect to their dashboard
    if (user.role !== "SUPER_ADMIN" && user.clientId) {
        redirect(`/analytics/${user.clientId}`);
    }

    // If Super Admin, get the first client or show a list (for now redirect to first active client)
    // Ideally we should show a list here, but for quick access let's check if they have a clientId or just pick one.
    if (user.role === "SUPER_ADMIN") {
        const firstClient = await prisma.client.findFirst({
            where: { isActive: true },
            select: { id: true },
        });

        if (firstClient) {
            redirect(`/analytics/${firstClient.id}`);
        }
    }

    // Default fallback if no clients
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
            <h1 className="text-2xl font-bold mb-4">Select a Client</h1>
            <p className="text-muted-foreground">No active clients found for analytics.</p>
        </div>
    );
}
