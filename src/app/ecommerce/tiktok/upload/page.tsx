import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Header } from "@/components/layout/header";
import TikTokUploadClient from "./upload-client";

export const metadata: Metadata = {
    title: "Upload Report - TikTok Seller",
};

export default async function TikTokUploadPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <Header user={user} />
            <TikTokUploadClient />
        </div>
    );
}
