import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Header } from "@/components/layout/header";
import Link from "next/link";
import { ArrowLeft, Upload, FileText, BarChart3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "TikTok Seller - Asoy Analytics Ads",
};

export default async function TikTokSellerPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const features = [
        {
            name: "Upload Report",
            description: "Upload file Kelola & Income untuk diproses",
            href: "/ecommerce/tiktok/upload",
            icon: Upload,
            gradient: "from-pink-500 to-red-500",
            available: true,
        },
        {
            name: "Reports",
            description: "Lihat hasil proses report sebelumnya",
            href: "/ecommerce/tiktok/reports",
            icon: FileText,
            gradient: "from-purple-500 to-indigo-500",
            available: true,
        },
        {
            name: "Analytics",
            description: "Dashboard performa TikTok Shop",
            href: "/ecommerce/tiktok/analytics",
            icon: BarChart3,
            gradient: "from-blue-500 to-cyan-500",
            available: false,
        },
        {
            name: "Settings",
            description: "Kelola brand dan pengaturan",
            href: "/ecommerce/tiktok/settings",
            icon: Settings,
            gradient: "from-gray-500 to-slate-600",
            available: false,
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <Header user={user} />

            <main className="container mx-auto px-6 py-8">
                {/* Page Header */}
                <div className="flex items-center space-x-4 mb-8">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/ecommerce">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 text-white flex items-center justify-center">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V8.25a8.16 8.16 0 0 0 4.77 1.52V6.3a4.85 4.85 0 0 1-1-.31z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">TikTok Seller</h1>
                            <p className="text-muted-foreground">
                                Antigravity Report Processing System
                            </p>
                        </div>
                    </div>
                </div>

                {/* Feature Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature) => (
                        <Link
                            key={feature.name}
                            href={feature.available ? feature.href : "#"}
                            className={`group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-200 hover:shadow-lg ${
                                feature.available
                                    ? "hover:border-pink-500/50 dark:hover:border-pink-500/50 cursor-pointer"
                                    : "opacity-50 cursor-not-allowed"
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} text-white flex items-center justify-center mb-4 ${
                                feature.available ? "group-hover:scale-110" : ""
                            } transition-transform`}>
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                                {feature.name}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {feature.description}
                            </p>
                            {!feature.available && (
                                <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                                    Coming Soon
                                </span>
                            )}
                        </Link>
                    ))}
                </div>

                {/* Info Card */}
                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-pink-50 to-red-50 dark:from-pink-950/30 dark:to-red-950/30 border border-pink-200 dark:border-pink-800">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">📊 Cara Kerja Report</h3>
                    <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        <li>1. Download file <strong>Kelola Pesanan</strong> dan <strong>Income</strong> dari TikTok Seller Center</li>
                        <li>2. Upload kedua file di halaman <strong>Upload Report</strong></li>
                        <li>3. Sistem akan memproses dan mencocokkan order berdasarkan Order ID</li>
                        <li>4. Lihat hasil summary dan breakdown harian di halaman <strong>Reports</strong></li>
                    </ol>
                </div>
            </main>
        </div>
    );
}
