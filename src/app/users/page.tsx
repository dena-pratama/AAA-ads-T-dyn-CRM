import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UsersClient } from "./users-client";

export const metadata: Metadata = {
    title: "User Management - Asoy Analytics Ads",
};

async function getUsers() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            client: {
                select: { name: true },
            },
        },
    });

    // Normalize data for client
    return users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        clientId: user.clientId,
        clientName: user.role === "SUPER_ADMIN" ? "Global" : (user.client?.name || "-"),
        image: user.image,
        createdAt: user.createdAt.toISOString(),
    }));
}

export default async function UsersPage() {
    const user = await getCurrentUser();

    if (!user || user.role !== "SUPER_ADMIN") {
        redirect("/dashboard");
    }

    const users = await getUsers();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <Header user={user} />

            <main className="container mx-auto px-6 py-8">
                {/* @ts-expect-error - Type matching issue with strict Prisma types vs UI types, safe to ignore for MVP */}
                <UsersClient data={users} />
            </main>
        </div>
    );
}
