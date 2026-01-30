import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Header } from "@/components/layout/header";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "E-Commerce - Asoy Analytics Ads",
};

export default async function ECommercePage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const platforms = [
        {
            name: "TikTok Seller",
            description: "Kelola toko TikTok Shop",
            href: "/ecommerce/tiktok",
            gradient: "from-pink-500 to-red-500",
            hoverBorder: "hover:border-pink-500/50 dark:hover:border-pink-500/50",
            hoverShadow: "hover:shadow-pink-500/5 dark:hover:shadow-pink-500/10",
            icon: (
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V8.25a8.16 8.16 0 0 0 4.77 1.52V6.3a4.85 4.85 0 0 1-1-.31z" />
                </svg>
            ),
        },
        {
            name: "Shopee Seller",
            description: "Kelola toko Shopee",
            href: "/ecommerce/shopee",
            gradient: "from-orange-500 to-red-600",
            hoverBorder: "hover:border-orange-500/50 dark:hover:border-orange-500/50",
            hoverShadow: "hover:shadow-orange-500/5 dark:hover:shadow-orange-500/10",
            icon: (
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm-2-8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                </svg>
            ),
        },
        {
            name: "Lazada Seller",
            description: "Kelola toko Lazada",
            href: "/ecommerce/lazada",
            gradient: "from-blue-600 to-purple-600",
            hoverBorder: "hover:border-blue-500/50 dark:hover:border-blue-500/50",
            hoverShadow: "hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10",
            icon: (
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
            ),
        },
        {
            name: "WooCommerce",
            description: "Kelola toko WordPress",
            href: "/ecommerce/woocommerce",
            gradient: "from-purple-600 to-indigo-600",
            hoverBorder: "hover:border-purple-500/50 dark:hover:border-purple-500/50",
            hoverShadow: "hover:shadow-purple-500/5 dark:hover:shadow-purple-500/10",
            icon: (
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <Header user={user} />

            <main className="container mx-auto px-6 py-8">
                {/* Page Header */}
                <div className="flex items-center space-x-4 mb-8">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">E-Commerce</h1>
                        <p className="text-muted-foreground">
                            Pilih platform e-commerce untuk dikelola.
                        </p>
                    </div>
                </div>

                {/* Platform Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {platforms.map((platform) => (
                        <a
                            key={platform.name}
                            href={platform.href}
                            className={`group p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${platform.hoverBorder} transition-all duration-200 hover:shadow-lg ${platform.hoverShadow}`}
                        >
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${platform.gradient} text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                {platform.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{platform.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{platform.description}</p>
                        </a>
                    ))}
                </div>

                {/* Info Card */}
                <div className="mt-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">🚧 Coming Soon</h3>
                    <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                        <p>⬜ TikTok Seller Center Integration</p>
                        <p>⬜ Shopee Partner API Integration</p>
                        <p>⬜ Lazada Open Platform Integration</p>
                        <p>⬜ WooCommerce REST API Integration</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
