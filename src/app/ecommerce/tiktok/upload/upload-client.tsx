"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Client {
    id: string;
    name: string;
}

interface SummaryGlobal {
    totalOrders: number;
    totalMatchedOrders: number;
    totalUnmatchedKelola: number;
    totalUnmatchedIncome: number;
    totalSettlement: number;
    totalRevenue: number;
    totalFees: number;
    dateRange: {
        from: string;
        to: string;
    };
}

export default function TikTokUploadClient() {
    const { data: session } = useSession();
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<string>("");
    const [kelolaFile, setKelolaFile] = useState<File | null>(null);
    const [incomeFile, setIncomeFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ reportId: string; summary: SummaryGlobal } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchClients();
    }, []);

    async function fetchClients() {
        try {
            const res = await fetch("/api/clients");
            if (res.ok) {
                const data = await res.json();
                setClients(data || []);
            }
        } catch {
            toast.error("Failed to fetch clients");
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setResult(null);

        if (!selectedClient) {
            setError("Pilih client terlebih dahulu");
            return;
        }
        if (!kelolaFile || !incomeFile) {
            setError("Upload kedua file (Kelola dan Income)");
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("clientId", selectedClient);
            formData.append("marketplace", "TIKTOK");
            formData.append("kelolaFile", kelolaFile);
            formData.append("incomeFile", incomeFile);

            const res = await fetch("/api/antigravity/reports", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Upload failed");
            }

            setResult(data);
            toast.success("Report berhasil diproses!");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
            toast.error("Gagal memproses report");
        } finally {
            setIsLoading(false);
        }
    }

    function formatCurrency(value: number) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    }

    return (
        <main className="container mx-auto px-6 py-8">
            {/* Page Header */}
            <div className="flex items-center space-x-4 mb-8">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/ecommerce/tiktok">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Upload Report</h1>
                    <p className="text-muted-foreground">
                        Upload file Kelola dan Income dari TikTok Seller Center
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Upload Files</CardTitle>
                        <CardDescription>
                            Pilih client dan upload kedua file XLSX
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Client Select */}
                            <div className="space-y-2">
                                <Label>Client</Label>
                                <Select value={selectedClient} onValueChange={setSelectedClient}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih client..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map((client) => (
                                            <SelectItem key={client.id} value={client.id}>
                                                {client.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {clients.length === 0 && (
                                    <div className="text-sm text-muted-foreground">
                                        <p>Belum ada client. Hubungi Admin.</p>
                                        <p className="text-xs mt-1 text-slate-400">
                                            (Debug: Role={session?.user?.role}, Clients={clients.length})
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Kelola File */}
                            <div className="space-y-2">
                                <Label>File Kelola Pesanan</Label>
                                <div
                                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                                        kelolaFile
                                            ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                                            : "border-slate-300 dark:border-slate-700 hover:border-pink-500"
                                    }`}
                                    onClick={() => document.getElementById("kelolaInput")?.click()}
                                >
                                    <input
                                        id="kelolaInput"
                                        type="file"
                                        accept=".xlsx,.xls"
                                        className="hidden"
                                        onChange={(e) => setKelolaFile(e.target.files?.[0] || null)}
                                    />
                                    {kelolaFile ? (
                                        <div className="text-green-600 dark:text-green-400">
                                            <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
                                            <p className="font-medium">{kelolaFile.name}</p>
                                            <p className="text-sm">
                                                {(kelolaFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-slate-500">
                                            <Upload className="w-8 h-8 mx-auto mb-2" />
                                            <p>Klik untuk upload file Kelola</p>
                                            <p className="text-xs">.xlsx atau .xls (max 20MB)</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Income File */}
                            <div className="space-y-2">
                                <Label>File Income</Label>
                                <div
                                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                                        incomeFile
                                            ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                                            : "border-slate-300 dark:border-slate-700 hover:border-pink-500"
                                    }`}
                                    onClick={() => document.getElementById("incomeInput")?.click()}
                                >
                                    <input
                                        id="incomeInput"
                                        type="file"
                                        accept=".xlsx,.xls"
                                        className="hidden"
                                        onChange={(e) => setIncomeFile(e.target.files?.[0] || null)}
                                    />
                                    {incomeFile ? (
                                        <div className="text-green-600 dark:text-green-400">
                                            <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
                                            <p className="font-medium">{incomeFile.name}</p>
                                            <p className="text-sm">
                                                {(incomeFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-slate-500">
                                            <Upload className="w-8 h-8 mx-auto mb-2" />
                                            <p>Klik untuk upload file Income</p>
                                            <p className="text-xs">.xlsx atau .xls (max 20MB)</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-500 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
                                disabled={isLoading || !selectedClient || !kelolaFile || !incomeFile}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Process Report
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Result Card */}
                {result && (
                    <Card className="border-green-500">
                        <CardHeader>
                            <CardTitle className="text-green-600 dark:text-green-400 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5" />
                                Report Berhasil Diproses
                            </CardTitle>
                            <CardDescription>
                                Report ID: {result.reportId}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
                                    <p className="text-sm text-muted-foreground">Total Settlement</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {formatCurrency(result.summary.totalSettlement)}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
                                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                                    <p className="text-xl font-bold">
                                        {formatCurrency(result.summary.totalRevenue)}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
                                    <p className="text-sm text-muted-foreground">Matched Orders</p>
                                    <p className="text-xl font-bold">{result.summary.totalMatchedOrders}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
                                    <p className="text-sm text-muted-foreground">Total Fees</p>
                                    <p className="text-xl font-bold text-red-500">
                                        {formatCurrency(result.summary.totalFees)}
                                    </p>
                                </div>
                            </div>

                            <div className="text-sm text-muted-foreground">
                                Date Range: {result.summary.dateRange.from} - {result.summary.dateRange.to}
                            </div>

                            {(result.summary.totalUnmatchedKelola > 0 || result.summary.totalUnmatchedIncome > 0) && (
                                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 text-sm">
                                    <p className="font-medium text-yellow-700 dark:text-yellow-400">⚠️ Unmatched Orders</p>
                                    <p className="text-yellow-600 dark:text-yellow-500">
                                        {result.summary.totalUnmatchedKelola} dari Kelola, {result.summary.totalUnmatchedIncome} dari Income
                                    </p>
                                </div>
                            )}

                            <Button asChild className="w-full">
                                <Link href={`/ecommerce/tiktok/reports/${result.reportId}`}>
                                    Lihat Detail Report
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </main>
    );
}
