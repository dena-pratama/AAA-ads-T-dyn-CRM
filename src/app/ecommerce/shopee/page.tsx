import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Header } from "@/components/layout/header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, FileText, BarChart3, Settings, UploadCloud, FileBarChart } from "lucide-react";

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
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V8.25a8.16 8.16 0 0 0 4.77 1.52V6.3a4.85 4.85 0 0 1-1-.31z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                Shopee Seller Reports
                            </h2>
                            <p className="text-muted-foreground mt-2">
                                Upload & Analisa Laporan Keuangan Shopee (Orders & Income)
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 mt-8">
                    {/* Upload Card */}
                    <Card className="hover:shadow-lg transition-shadow border-orange-100 dark:border-orange-900">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-4 text-orange-600 dark:text-orange-400">
                                <UploadCloud className="w-6 h-6" />
                            </div>
                            <CardTitle>Upload Report Baru</CardTitle>
                            <CardDescription>
                                Proses file Excel dari Shopee Seller Center
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Support file: Orders (Pesanan) dan Income (Penghasilan/Saldo).
                                Otomatis matching data.
                            </p>
                            <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                                <Link href="/ecommerce/shopee/upload">Mulai Upload</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* History Card */}
                    <Card className="hover:shadow-lg transition-shadow border-slate-100 dark:border-slate-800">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-600 dark:text-slate-400">
                                <FileBarChart className="w-6 h-6" />
                            </div>
                            <CardTitle>Riwayat Report</CardTitle>
                            <CardDescription>
                                Lihat hasil analisa yang sudah diproses
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Akses kembali data settlement, revenue, dan fees per tanggal.
                            </p>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/ecommerce/shopee/reports">Lihat Semua</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Info Card */}
                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-200 dark:border-orange-800">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">📊 Cara Kerja Report</h3>
                    <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        <li>1. Download file <strong>Orders</strong> dan <strong>Income</strong> dari Shopee Seller Center</li>
                        <li>2. Upload kedua file di halaman <strong>Upload Report</strong></li>
                        <li>3. Sistem akan mencocokkan (Match) Order ID dengan Settlement</li>
                        <li>4. Hasil analisa keluar dalam hitungan detik!</li>
                    </ol>
                </div>
            </main>
        </div>
    );
}
