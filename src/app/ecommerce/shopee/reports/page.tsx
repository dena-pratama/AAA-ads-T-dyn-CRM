import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Header } from "@/components/layout/header";
import ShopeeReportsClient from "./reports-client";

export const metadata: Metadata = {
    title: "Reports - Shopee Seller",
};

export default async function ShopeeReportsPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <Header user={user} />
            <ShopeeReportsClient />
        </div>
    );
}
