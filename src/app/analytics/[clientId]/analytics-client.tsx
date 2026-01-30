"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Target,
    Download,
    ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { CampaignPerformanceTable } from "./campaign-table";
import { AnalyticsSettings } from "./analytics-settings";

interface Client {
    id: string;
    name: string;
    logo: string | null;
    currency: string;
}

interface CampaignStat {
    id: string;
    name: string;
    platform: string;
    spend: number;
    impressions: number;
    clicks: number;
    leads: number;
    revenue: number;
    ctr: number;
    cpc: number;
    cpl: number;
    roas: number;
}

interface AnalyticsData {
    client: Client;
    config: {
        preset: string;
        metrics: Array<{
            id: string;
            label: string;
            format: string;
            visible: boolean;
            order: number;
        }>;
    };
    metrics: Record<string, number>;
    charts: {
        monthly: Array<{
            month: string;
            spend: number;
            impressions: number;
            clicks: number;
            leads: number;
        }>;
    };
}

interface AnalyticsClientProps {
    client: Client;
    clients?: Client[];
    isSuperAdmin?: boolean;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatMonth(monthStr: string) {
    const [year, month] = monthStr.split("-");
    return `${MONTHS[parseInt(month || "1") - 1]} ${year}`;
}

function formatCurrency(value: number, currency: string = "IDR") {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function formatNumber(value: number) {
    return new Intl.NumberFormat("id-ID").format(Math.round(value));
}

function formatPercent(value: number) {
    return `${value.toFixed(2)}%`;
}

export function AnalyticsClient({ client, clients = [], isSuperAdmin = false }: AnalyticsClientProps) {
    const router = useRouter();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [platform, setPlatform] = useState<string>("all");
    const [dateRange, setDateRange] = useState<string>("6m");

    const [campaignStats, setCampaignStats] = useState<CampaignStat[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [stages, setStages] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, [client.id, platform, dateRange]); // eslint-disable-line react-hooks/exhaustive-deps

    async function fetchData() {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (platform !== "all") params.set("platform", platform);

            // Calculate date range
            const endDate = new Date();
            const startDate = new Date();
            if (dateRange === "1m") startDate.setMonth(startDate.getMonth() - 1);
            else if (dateRange === "3m") startDate.setMonth(startDate.getMonth() - 3);
            else if (dateRange === "6m") startDate.setMonth(startDate.getMonth() - 6);
            else if (dateRange === "1y") startDate.setFullYear(startDate.getFullYear() - 1);

            params.set("startDate", startDate.toISOString().slice(0, 10));
            params.set("endDate", endDate.toISOString().slice(0, 10));

            const queryString = params.toString();

            // Parallel fetch
            const [resOverview, resCampaigns] = await Promise.all([
                fetch(`/api/analytics/${client.id}?${queryString}`),
                fetch(`/api/analytics/${client.id}/campaigns?${queryString}`)
            ]);

            if (!resOverview.ok) throw new Error("Failed to fetch overview");

            const jsonOverview = await resOverview.json();
            const jsonCampaignsResponse = resCampaigns.ok ? await resCampaigns.json() : { stats: [], stages: [] };

            // Handle both legacy (array) and new (object) response formats
            const campaignsData = Array.isArray(jsonCampaignsResponse)
                ? jsonCampaignsResponse
                : jsonCampaignsResponse.stats || [];

            const stagesData = !Array.isArray(jsonCampaignsResponse)
                ? jsonCampaignsResponse.stages || []
                : [];

            setData(jsonOverview);
            setCampaignStats(campaignsData);
            setStages(stagesData);
        } catch (error) {
            toast.error("Failed to load analytics data");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleExport = () => {
        if (!campaignStats.length) {
            toast.error("No data to export");
            return;
        }

        const wb = XLSX.utils.book_new();

        // Format data for export
        const exportData = campaignStats.map(item => ({
            "Campaign Name": item.name,
            "Platform": item.platform,
            "Spend": item.spend,
            "Impressions": item.impressions,
            "Clicks": item.clicks,
            "Leads": item.leads,
            "CTR (%)": item.ctr.toFixed(2),
            "CPC": item.cpc,
            "CPL": item.cpl,
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(wb, ws, "Campaign Performance");

        // Generate filename
        const filename = `Analytics_${client.name}_${dateRange}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, filename);
        toast.success("Export started");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading analytics...</div>
            </div>
        );
    }

    const metrics = data?.metrics || {};
    const chartData = data?.charts?.monthly?.map(item => ({
        ...item,
        name: formatMonth(item.month || ""),
    })) || [];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="flex">
                {/* Sidebar - KPI Cards */}
                <aside className="w-64 min-h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6">
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex-1 mr-2">
                                {isSuperAdmin && clients.length > 0 ? (
                                    <Select
                                        value={client.id}
                                        onValueChange={(val) => router.push(`/analytics/${val}`)}
                                    >
                                        <SelectTrigger className="w-full h-10 bg-white dark:bg-slate-950">
                                            <div className="flex items-center gap-2 text-left overflow-hidden">
                                                {client.logo ? (
                                                    /* eslint-disable-next-line @next/next/no-img-element */
                                                    <img src={client.logo} alt={client.name} className="w-5 h-5 rounded object-cover flex-shrink-0" />
                                                ) : (
                                                    <div className="w-5 h-5 rounded bg-amber-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                                                        {client.name.charAt(0)}
                                                    </div>
                                                )}
                                                <span className="font-semibold truncate text-sm">{client.name}</span>
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="z-[9999] max-h-[300px]">
                                            {clients.map(c => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5 h-5 rounded bg-slate-200 flex items-center justify-center text-xs font-medium flex-shrink-0">
                                                            {c.name.charAt(0)}
                                                        </div>
                                                        <span className="truncate">{c.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold">
                                            {client.name.charAt(0)}
                                        </div>
                                        <span className="font-semibold text-lg">{client.name}</span>
                                    </div>
                                )}
                            </div>

                            {/* SETTINGS BUTTON */}
                            <AnalyticsSettings
                                metrics={data?.config?.metrics || []}
                                onSave={(newMetrics) => {
                                    if (data) {
                                        setData({
                                            ...data,
                                            config: { ...data.config, metrics: newMetrics }
                                        });
                                    }
                                }}
                            />
                        </div>
                        {isSuperAdmin && clients.length > 0 && (
                            <p className="text-[10px] text-muted-foreground ml-1">
                                {clients.length} Clients Available
                            </p>
                        )}
                    </div>

                    {/* KPI Cards */}
                    <div className="space-y-4">
                        {/* Financials Row */}
                        {data?.config.metrics.find(m => m.id === "revenue")?.visible && (
                            <KPICard
                                label="TOTAL REVENUE"
                                value={formatCurrency(metrics.revenue || 0)}
                                icon={<DollarSign className="h-4 w-4 text-green-500" />}
                                className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                            />
                        )}

                        {data?.config.metrics.find(m => m.id === "roas")?.visible && (
                            <KPICard
                                label="ROAS (Return On Ad Spend)"
                                value={`${(metrics.roas || 0).toFixed(2)}x`}
                                icon={<TrendingUp className="h-4 w-4 text-blue-500" />}
                                trend={(metrics.roas || 0) > 1 ? "up" : "down"}
                            />
                        )}

                        <div className="h-px bg-slate-200 dark:bg-slate-800 my-4" />

                        {data?.config.metrics.find(m => m.id === "spend")?.visible && (
                            <KPICard
                                label="TOTAL AD SPENT"
                                value={formatCurrency(metrics.spend || 0)}
                                icon={<DollarSign className="h-4 w-4" />}
                            />
                        )}
                        {data?.config.metrics.find(m => m.id === "leads")?.visible && (
                            <KPICard
                                label="TOTAL LEADS"
                                value={formatNumber(metrics.leads || 0)}
                                icon={<Users className="h-4 w-4" />}
                            />
                        )}

                        {/* Secondary Metrics */}
                        <div className="grid grid-cols-2 gap-2">
                            {data?.config.metrics.find(m => m.id === "impressions")?.visible && (
                                <KPICard
                                    label="IMPRESSIONS"
                                    value={formatNumber(metrics.impressions || 0)}
                                    compact
                                />
                            )}
                            {data?.config.metrics.find(m => m.id === "clicks")?.visible && (
                                <KPICard
                                    label="CLICKS"
                                    value={formatNumber(metrics.clicks || 0)}
                                    compact
                                />
                            )}
                        </div>

                        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4 space-y-3">
                            {data?.config.metrics.find(m => m.id === "ctr")?.visible && (
                                <KPICard
                                    label="CTR"
                                    value={formatPercent(metrics.ctr || 0)}
                                    trend={(metrics.ctr || 0) > 1 ? "up" : "down"}
                                    compact
                                />
                            )}
                            {data?.config.metrics.find(m => m.id === "cpc")?.visible && (
                                <KPICard
                                    label="CPC"
                                    value={formatCurrency(metrics.cpc || 0)}
                                    compact
                                />
                            )}
                            {data?.config.metrics.find(m => m.id === "cpl")?.visible && (
                                <KPICard
                                    label="COST PER LEAD"
                                    value={formatCurrency(metrics.cpl || 0)}
                                    compact
                                />
                            )}
                        </div>
                    </div>

                    {/* Back Link */}
                    <div className="absolute bottom-6 left-6">
                        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                            <ChevronLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold">Ads Performance Report</h1>
                            <p className="text-muted-foreground">
                                {dateRange === "1m" && "Last month"}
                                {dateRange === "3m" && "Last 3 months"}
                                {dateRange === "6m" && "Last 6 months"}
                                {dateRange === "1y" && "Last year"}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Platform Filter */}
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant={platform === "all" ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => setPlatform("all")}
                                >
                                    All
                                </Badge>
                                <Badge
                                    variant={platform === "META" ? "default" : "outline"}
                                    className="cursor-pointer bg-blue-500"
                                    onClick={() => setPlatform("META")}
                                >
                                    Meta
                                </Badge>
                                <Badge
                                    variant={platform === "GOOGLE" ? "default" : "outline"}
                                    className="cursor-pointer bg-green-500"
                                    onClick={() => setPlatform("GOOGLE")}
                                >
                                    Google
                                </Badge>
                                <Badge
                                    variant={platform === "TIKTOK" ? "default" : "outline"}
                                    className="cursor-pointer bg-pink-500"
                                    onClick={() => setPlatform("TIKTOK")}
                                >
                                    TikTok
                                </Badge>
                            </div>

                            {/* Date Range */}
                            <Select value={dateRange} onValueChange={setDateRange}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1m">1 Month</SelectItem>
                                    <SelectItem value="3m">3 Months</SelectItem>
                                    <SelectItem value="6m">6 Months</SelectItem>
                                    <SelectItem value="1y">1 Year</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Export Button */}
                            <Button variant="outline" onClick={handleExport}>
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Amount Spent Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Amount Spent</CardTitle>
                                <p className="text-sm text-muted-foreground">Monthly trend analysis</p>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <AreaChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                                        <XAxis dataKey="name" className="text-xs" />
                                        <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                                        <Tooltip
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            formatter={(value: any) => formatCurrency(Number(value || 0))}
                                            contentStyle={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="spend"
                                            stroke="#78716c"
                                            fill="#d6d3d1"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Leads Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Potential Leads</CardTitle>
                                <p className="text-sm text-muted-foreground">Top of funnel metrics</p>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                                        <XAxis dataKey="name" className="text-xs" />
                                        <YAxis className="text-xs" />
                                        <Tooltip contentStyle={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }} />
                                        <Bar dataKey="leads" fill="#ca8a04" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Clicks Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Click Performance</CardTitle>
                                <p className="text-sm text-muted-foreground">Engagement metrics</p>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                                        <XAxis dataKey="name" className="text-xs" />
                                        <YAxis className="text-xs" />
                                        <Tooltip contentStyle={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }} />
                                        <Bar dataKey="clicks" fill="#78350f" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Impressions Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Impressions</CardTitle>
                                <p className="text-sm text-muted-foreground">Reach and visibility</p>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                                        <XAxis dataKey="name" className="text-xs" />
                                        <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                                        <Tooltip
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            formatter={(value: any) => formatNumber(Number(value || 0))}
                                            contentStyle={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }}
                                        />
                                        <Bar dataKey="impressions" fill="#92400e" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Campaign Performance Table */}
                    {/* Campaign Performance Table */}
                    <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight">Campaign Performance</h2>
                            {/* Placeholder for Export Button */}
                        </div>
                        <CampaignPerformanceTable data={campaignStats} stages={stages} />
                    </div>
                </main >
            </div >
        </div >
    );
}

interface KPICardProps {
    label: string;
    value: string;
    icon?: React.ReactNode;
    trend?: "up" | "down";
    className?: string;
    compact?: boolean;
}

function KPICard({ label, value, icon, trend, className = "", compact = false }: KPICardProps) {
    if (compact) {
        return (
            <div className={`p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg ${className}`}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
                <div className="flex items-center gap-1">
                    <span className="text-sm font-bold">{value}</span>
                    {trend && (
                        <span className={trend === "up" ? "text-green-500" : "text-red-500"}>
                            {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={`p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm ${className}`}>
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
                {icon}
            </div>
            <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight">{value}</span>
                {trend && (
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full flex items-center gap-1 ${trend === "up" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                        {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    </span>
                )}
            </div>
        </div>
    );
}
