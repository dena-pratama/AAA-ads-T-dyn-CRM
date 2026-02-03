import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Header } from "@/components/layout/header";
import ReportDetailClient from "./report-detail-client";

export const metadata: Metadata = {
    title: "Report Detail - TikTok Seller",
};

export default async function ReportDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const { id } = await params;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <Header user={user} />
            <ReportDetailClient reportId={id} />
        </div>
    );
}
