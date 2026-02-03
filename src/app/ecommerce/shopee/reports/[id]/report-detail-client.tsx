"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface SummaryGlobal {
    totalOrderKelola: number;
    totalSettlementFound: number;
    orderWithoutSettlement: number;
    settlementWithoutKelola: number;
    totalSettlementAmount: number;
    totalRevenue: number;
    totalFees: number;
    dateRange?: { from: string; to: string };
}

interface SummaryDaily {
    date: string;
    totalOrders: number;
    totalSettlementAmount: number;
    totalRevenue: number;
    totalFees: number;
}

interface UnmatchedRecord {
    orderId: string;
    source: string;
    rawData: Record<string, unknown>;
}

interface ReportResult {
    summaryGlobal: SummaryGlobal;
    summaryDaily: SummaryDaily[];
    kelolaUnmatched: UnmatchedRecord[];
    incomeUnmatched: UnmatchedRecord[];
}

interface Report {
    id: string;
    brandId: string;
    brandName: string;
    marketplace: string;
    status: string;
    createdAt: string;
    processedAt: string | null;
    kelolaFileName: string | null;
    incomeFileName: string | null;
    result: ReportResult | null;
    error: { message?: string } | null;
    resultJson: object; // Raw JSON
}

export default function ReportDetailClient({ reportId }: { reportId: string }) {
    const [report, setReport] = useState<Report | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, [reportId]);

    async function fetchReport() {
        try {
            const res = await fetch(`/api/antigravity/reports/${reportId}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            // Map resultJson to result if needed, but here we assume resultJson IS the result structure we defined above
            // The API returns 'report' object which has 'resultJson'. We need to cast it.
            const reportData = data.report;
            if (reportData && reportData.resultJson) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const rawResult = reportData.resultJson as any;

                // Polyfill dateRange if missing
                if (!rawResult.summaryGlobal.dateRange && rawResult.summaryDaily?.length > 0) {
                     rawResult.summaryGlobal.dateRange = {
                        from: rawResult.summaryDaily[0].date,
                        to: rawResult.summaryDaily[rawResult.summaryDaily.length - 1].date
                     };
                }

                // Fix unmatched array format (string[] -> UnmatchedRecord[])
                if (Array.isArray(rawResult.kelolaUnmatched) && rawResult.kelolaUnmatched.length > 0 && typeof rawResult.kelolaUnmatched[0] === 'string') {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    rawResult.kelolaUnmatched = rawResult.kelolaUnmatched.map((id: string) => ({ orderId: id, source: 'Orders', rawData: {} }));
                }
                if (Array.isArray(rawResult.incomeUnmatched) && rawResult.incomeUnmatched.length > 0 && typeof rawResult.incomeUnmatched[0] === 'string') {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    rawResult.incomeUnmatched = rawResult.incomeUnmatched.map((id: string) => ({ orderId: id, source: 'Income', rawData: {} }));
                }

                reportData.result = rawResult as ReportResult;
            }
            setReport(reportData);
        } catch {
            toast.error("Failed to fetch report");
        } finally {
            setIsLoading(false);
        }
    }

    function formatCurrency(value: number | null | undefined) {
        if (value == null || isNaN(Number(value))) return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(0);
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);
    }

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    if (isLoading) {
        return (
            <main className="container mx-auto px-6 py-8">
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
            </main>
        );
    }

    if (!report) {
        return (
            <main className="container mx-auto px-6 py-8">
                <div className="text-center py-24">
                    <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                    <p className="text-muted-foreground">Report tidak ditemukan</p>
                    <Button asChild className="mt-4">
                        <Link href="/ecommerce/shopee/reports">Kembali ke List</Link>
                    </Button>
                </div>
            </main>
        );
    }

    const result = report.result;

    return (
        <main className="container mx-auto px-6 py-8">
            {/* Page Header */}
            <div className="flex items-center space-x-4 mb-8">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/ecommerce/shopee/reports">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Report Detail (Shopee)
                        </h1>
                        {report.status === "DONE" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                        {report.status === "FAILED" && <XCircle className="w-5 h-5 text-red-500" />}
                    </div>
                    <p className="text-muted-foreground">
                        {report.brandName} • {formatDate(report.createdAt)}
                    </p>
                </div>
            </div>

            {report.status === "FAILED" && (
                <Card className="mb-6 border-red-500">
                    <CardContent className="py-4">
                        <div className="flex items-center gap-2 text-red-500">
                            <XCircle className="w-5 h-5" />
                            <span className="font-medium">Report gagal diproses</span>
                        </div>
                        {report.error?.message && (
                            <p className="mt-2 text-sm text-muted-foreground">{report.error.message}</p>
                        )}
                    </CardContent>
                </Card>
            )}

            {result && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground">Total Settlement</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(result.summaryGlobal.totalSettlementAmount)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground">Total Revenue</p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(result.summaryGlobal.totalRevenue)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground">Total Fees</p>
                                <p className="text-2xl font-bold text-red-500">
                                    {formatCurrency(result.summaryGlobal.totalFees)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground">Matched Orders</p>
                                <p className="text-2xl font-bold">{result.summaryGlobal.totalSettlementFound}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Date Range Info */}
                    <Card className="mb-6">
                        <CardContent className="py-4">
                            <p className="text-sm">
                                <span className="text-muted-foreground">Period:</span>{" "}
                                <span className="font-medium">
                                    {result.summaryGlobal.dateRange?.from || "?"} - {result.summaryGlobal.dateRange?.to || "?"}
                                </span>
                            </p>
                        </CardContent>
                    </Card>

                    {/* Tabs */}
                    <Tabs defaultValue="daily" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="daily">Summary Daily</TabsTrigger>
                            <TabsTrigger value="unmatched">
                                Unmatched
                                {(result.kelolaUnmatched.length > 0 || result.incomeUnmatched.length > 0) && (
                                    <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs">
                                        {result.kelolaUnmatched.length + result.incomeUnmatched.length}
                                    </span>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="daily">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Daily Breakdown</CardTitle>
                                    <CardDescription>Summary per tanggal</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tanggal</TableHead>
                                                <TableHead className="text-right">Orders</TableHead>
                                                <TableHead className="text-right">Settlement</TableHead>
                                                <TableHead className="text-right">Revenue</TableHead>
                                                <TableHead className="text-right">Fees</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {result.summaryDaily.map((day) => (
                                                <TableRow key={day.date}>
                                                    <TableCell className="font-medium">{day.date}</TableCell>
                                                    <TableCell className="text-right">{day.totalOrders}</TableCell>
                                                    <TableCell className="text-right text-green-600">
                                                        {formatCurrency(day.totalSettlementAmount)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(day.totalRevenue)}
                                                    </TableCell>
                                                    <TableCell className="text-right text-red-500">
                                                        {formatCurrency(day.totalFees)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="unmatched">
                            <div className="space-y-4">
                                {result.kelolaUnmatched.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                                Unmatched dari Orders ({result.kelolaUnmatched.length})
                                            </CardTitle>
                                            <CardDescription>
                                                Order ID yang ada di Orders tapi tidak ditemukan di Income
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Order ID</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {result.kelolaUnmatched.slice(0, 50).map((item, idx) => (
                                                        <TableRow key={idx}>
                                                            <TableCell className="font-mono">{item.orderId}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                            {result.kelolaUnmatched.length > 50 && (
                                                <p className="text-center py-2 text-sm text-muted-foreground">
                                                    ... dan {result.kelolaUnmatched.length - 50} lainnya
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {result.incomeUnmatched.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                                Unmatched dari Income ({result.incomeUnmatched.length})
                                            </CardTitle>
                                            <CardDescription>
                                                Order ID yang ada di Income tapi tidak ditemukan di Orders
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Order ID</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {result.incomeUnmatched.slice(0, 50).map((item, idx) => (
                                                        <TableRow key={idx}>
                                                            <TableCell className="font-mono">{item.orderId}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                            {result.incomeUnmatched.length > 50 && (
                                                <p className="text-center py-2 text-sm text-muted-foreground">
                                                    ... dan {result.incomeUnmatched.length - 50} lainnya
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {result.kelolaUnmatched.length === 0 && result.incomeUnmatched.length === 0 && (
                                    <Card>
                                        <CardContent className="py-8 text-center">
                                            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                                            <p className="text-muted-foreground">Semua order matched!</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </main>
    );
}
