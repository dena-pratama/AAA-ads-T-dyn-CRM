"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Loader2, CheckCircle2, XCircle, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Report {
    id: string;
    brandId: string;
    brandName: string;
    marketplace: string;
    status: "PROCESSING" | "DONE" | "FAILED";
    createdAt: string;
    processedAt: string | null;
    kelolaFileName: string | null;
    incomeFileName: string | null;
    totalSettlement: number | null;
    dataPeriod: string | null;
}

interface Brand {
    id: string;
    name: string;
}

export default function TikTokReportsClient() {
    const [reports, setReports] = useState<Report[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [selectedBrand, setSelectedBrand] = useState<string>("all");
    const [isLoading, setIsLoading] = useState(true);
    const [reportToDelete, setReportToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchBrands();
        fetchReports();
    }, []);

    useEffect(() => {
        fetchReports();
    }, [selectedBrand]);

    async function fetchBrands() {
        try {
            const res = await fetch("/api/antigravity/brands");
            const data = await res.json();
            setBrands(data.brands?.filter((b: Brand & { marketplace: string }) => b.marketplace === "TIKTOK") || []);
        } catch {
            toast.error("Failed to fetch brands");
        }
    }

    async function fetchReports() {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedBrand !== "all") {
                params.set("brandId", selectedBrand);
            }
            params.set("marketplace", "TIKTOK");

            const res = await fetch(`/api/antigravity/reports/list?${params}`);
            const data = await res.json();
            setReports(data.reports || []);
        } catch {
            toast.error("Failed to fetch reports");
        } finally {
            setIsLoading(false);
        }
    }

    async function deleteReport() {
        if (!reportToDelete) return;

        try {
            const res = await fetch(`/api/antigravity/reports/${reportToDelete}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");

            toast.success("Report deleted successfully");
            fetchReports();
        } catch {
            toast.error("Failed to delete report");
        } finally {
            setReportToDelete(null);
        }
    }

    function formatCurrency(value: number | null) {
        if (value === null) return "-";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);
    }

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function formatMonth(dateString: string | null) {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleString("id-ID", {
            month: "long",
            year: "numeric",
        });
    }

    function getStatusIcon(status: string) {
        switch (status) {
            case "DONE":
                return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case "FAILED":
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-yellow-500" />;
        }
    }

    return (
        <main className="container mx-auto px-6 py-8">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/ecommerce/tiktok">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Reports</h1>
                        <p className="text-muted-foreground">
                            Daftar hasil proses report TikTok Seller
                        </p>
                    </div>
                </div>
                <Button asChild className="bg-gradient-to-r from-pink-500 to-red-500">
                    <Link href="/ecommerce/tiktok/upload">
                        Upload Report Baru
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardHeader className="py-4">
                    <CardTitle className="text-base">Filter</CardTitle>
                </CardHeader>
                <CardContent className="py-0 pb-4">
                    <div className="flex gap-4">
                        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Semua Brand" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Brand</SelectItem>
                                {brands.map((brand) => (
                                    <SelectItem key={brand.id} value={brand.id}>
                                        {brand.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Reports Table */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                            <p className="text-muted-foreground">Belum ada report</p>
                            <Button asChild className="mt-4">
                                <Link href="/ecommerce/tiktok/upload">
                                    Upload Report Pertama
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Brand</TableHead>
                                    <TableHead>Bulan</TableHead>
                                    <TableHead>Tanggal Upload</TableHead>
                                    <TableHead>Files</TableHead>
                                    <TableHead className="text-right">Total Settlement</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports.map((report) => (
                                    <TableRow key={report.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(report.status)}
                                                <span className="capitalize">{report.status.toLowerCase()}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{report.brandName}</TableCell>
                                        <TableCell>{formatMonth(report.dataPeriod)}</TableCell>
                                        <TableCell>{formatDate(report.createdAt)}</TableCell>
                                        <TableCell>
                                            <div className="text-xs">
                                                <p>{report.kelolaFileName}</p>
                                                <p className="text-muted-foreground">{report.incomeFileName}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(report.totalSettlement)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/ecommerce/tiktok/reports/${report.id}`}>
                                                        Detail
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => setReportToDelete(report.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={!!reportToDelete} onOpenChange={(open) => !open && setReportToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Report?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Report ini akan dihapus permanen dari sistem.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={deleteReport}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </main>
    );
}
