import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./settings-client";

export const metadata: Metadata = {
    title: "Profile Settings - Asoy Analytics Ads",
};

async function getProfile(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            client: { select: { name: true } }
        }
    });

    if (!user) return null;

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clientName: user.client?.name || (user.role === "SUPER_ADMIN" ? "Global Admin" : "-"),
        image: user.image,
    };
}

export default async function SettingsPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect("/login");
    }

    const profile = await getProfile(session.user.id);

    if (!profile) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* @ts-ignore - Header user types mismatch slightly but compatible */}
            <Header user={session.user} />

            <main className="container mx-auto px-6 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Account Settings</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your profile and preferences</p>
                    </div>

                    <SettingsClient user={profile} />
                </div>
            </main>
        </div>
    );
}
