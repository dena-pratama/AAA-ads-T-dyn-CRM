import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SpendClient } from "./spend-client";

export const metadata: Metadata = {
    title: "Ad Spend - Asoy Analytics Ads",
};

export default async function SpendPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch clients for SuperAdmin filter
    let clients: { id: string; name: string }[] = [];
    if (user.role === "SUPER_ADMIN") {
        clients = await prisma.client.findMany({
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        });
    }

    return (
        <SpendClient
            clients={clients}
            isSuperAdmin={user.role === "SUPER_ADMIN"}
        />
    );
}
