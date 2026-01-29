import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Header } from "@/components/layout/header";

export const metadata: Metadata = {
    title: "Dashboard - Asoy Analytics Ads",
};

export default async function DashboardPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    // TypeScript doesn't track redirect() ensuring user is not null here
    const authenticatedUser = user;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <Header user={authenticatedUser} />

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8">
                {/* Welcome Card */}
                <div className="mb-8 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Selamat datang, {user.name}! 👋
                        </h2>

                    </div>
                    {/* Decorative gradient blob */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Clients Card */}
                    <a
                        href="/clients"
                        className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10"
                    >
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Clients</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Kelola data klien</p>
                    </a>

                    {/* Ad Spend Card */}
                    <a
                        href="/spend"
                        className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-green-500/50 dark:hover:border-green-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/5 dark:hover:shadow-green-500/10"
                    >
                        <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Ad Spend</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Import & kelola biaya iklan</p>
                    </a>

                    {/* Leads Card */}
                    <a
                        href="/leads"
                        className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/5 dark:hover:shadow-purple-500/10"
                    >
                        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Leads</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Input & tracking leads CRM</p>
                    </a>

                    {/* Analytics Card */}
                    <a
                        href="/analytics"
                        className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 dark:hover:border-orange-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/5 dark:hover:shadow-orange-500/10"
                    >
                        <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Analytics</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Lihat performa & ROAS</p>
                    </a>

                    {/* Pipelines Card */}
                    <a
                        href="/pipelines"
                        className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-pink-500/50 dark:hover:border-pink-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/5 dark:hover:shadow-pink-500/10"
                    >
                        <div className="w-12 h-12 rounded-xl bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Pipelines</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Atur stages & fields</p>
                    </a>

                    {/* Campaigns Card */}
                    <a
                        href="/campaigns"
                        className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 dark:hover:border-cyan-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/5 dark:hover:shadow-cyan-500/10"
                    >
                        <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Campaigns</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Manage & merge campaigns</p>
                    </a>
                </div>

                {/* Info */}
                <div className="mt-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">🚧 Status Development</h3>
                    <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                        <p>✅ Authentication system & Rebranding</p>
                        <p>✅ Light/Dark Mode Support</p>
                        <p>🔄 Client & Pipeline management (in progress)</p>
                        <p>⬜ CSV Import engine</p>
                        <p>⬜ Data grid dengan inline editing</p>
                        <p>⬜ CRM Lead entry</p>
                        <p>⬜ Analytics dashboard</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
