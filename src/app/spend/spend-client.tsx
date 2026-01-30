"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/data-table";
import { getSpendColumns, SpendLog } from "@/components/spend/columns";
import { Upload, ArrowLeft, Loader2, Search, Calendar } from "lucide-react";
import { toast } from "sonner";

const PLATFORMS = ["META", "GOOGLE", "TIKTOK", "SHOPEE", "TOKOPEDIA", "LAZADA", "OTHER"];

interface Client {
    id: string;
    name: string;
}

interface SpendClientProps {
    clients: Client[];
    isSuperAdmin: boolean;
}

export function SpendClient({ clients, isSuperAdmin }: SpendClientProps) {
    const [mounted, setMounted] = useState(false);
    const [spendLogs, setSpendLogs] = useState<SpendLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    // Filters
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [platformFilter, setPlatformFilter] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Edit Dialog
    const [editOpen, setEditOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<SpendLog | null>(null);
    const [editForm, setEditForm] = useState({
        spend: "",
        impressions: "",
        clicks: "",
        reach: "",
    });
    const [saving, setSaving] = useState(false);

    // Delete Dialog
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletingLog, setDeletingLog] = useState<SpendLog | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const fetchSpendLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedClientId) params.append("clientId", selectedClientId);
            if (platformFilter !== "all") params.append("platform", platformFilter);
            if (startDate) params.append("startDate", startDate);
            if (endDate) params.append("endDate", endDate);

            const res = await fetch(`/api/spend?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setSpendLogs(data.data || []);
                setTotal(data.total || 0);
            } else {
                toast.error("Failed to fetch spend data");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    }, [selectedClientId, platformFilter, startDate, endDate]);

    useEffect(() => {
        if (mounted) {
            fetchSpendLogs();
        }
    }, [mounted, fetchSpendLogs]);

    const handleEdit = (log: SpendLog) => {
        setEditingLog(log);
        setEditForm({
            spend: String(log.spend),
            impressions: String(log.impressions),
            clicks: String(log.clicks),
            reach: String(log.reach),
        });
        setEditOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingLog) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/spend/${editingLog.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    spend: parseFloat(editForm.spend) || 0,
                    impressions: parseInt(editForm.impressions) || 0,
                    clicks: parseInt(editForm.clicks) || 0,
                    reach: parseInt(editForm.reach) || 0,
                }),
            });

            if (res.ok) {
                toast.success("Record updated");
                setEditOpen(false);
                fetchSpendLogs();
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to update");
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error("An error occurred");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (log: SpendLog) => {
        setDeletingLog(log);
        setDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingLog) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/spend/${deletingLog.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Record deleted");
                setDeleteOpen(false);
                fetchSpendLogs();
            } else {
                toast.error("Failed to delete");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("An error occurred");
        } finally {
            setDeleting(false);
        }
    };

    // Filter by search term (client-side)
    const filteredLogs = spendLogs.filter((log) => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            log.campaignName.toLowerCase().includes(search) ||
            (log.campaign?.name || "").toLowerCase().includes(search)
        );
    });

    const columns = getSpendColumns({ onEdit: handleEdit, onDelete: handleDelete });

    if (!mounted) {
        return null;
    }

    return (
        <div className="space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Ad Spend</h2>
                        <p className="text-muted-foreground">
                            {total.toLocaleString()} records
                        </p>
                    </div>
                </div>
                <Button asChild>
                    <Link href="/spend/import">
                        <Upload className="mr-2 h-4 w-4" />
                        Import Data
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-end">
                {isSuperAdmin && (
                    <div className="w-[200px]">
                        <Label className="text-xs text-muted-foreground">Client</Label>
                        <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Clients" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Clients</SelectItem>
                                {clients.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="w-[150px]">
                    <Label className="text-xs text-muted-foreground">Platform</Label>
                    <Select value={platformFilter} onValueChange={setPlatformFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="All Platforms" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Platforms</SelectItem>
                            {PLATFORMS.map((p) => (
                                <SelectItem key={p} value={p}>
                                    {p}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-[150px]">
                    <Label className="text-xs text-muted-foreground">Start Date</Label>
                    <div className="relative">
                        <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                <div className="w-[150px]">
                    <Label className="text-xs text-muted-foreground">End Date</Label>
                    <div className="relative">
                        <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                    <Label className="text-xs text-muted-foreground">Search</Label>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search campaigns..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
            </div>

            {/* Data Table */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <DataTable columns={columns} data={filteredLogs} />
            )}

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Spend Record</DialogTitle>
                        <DialogDescription>
                            Update the metrics for {editingLog?.campaignName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="spend" className="text-right">
                                Spend (IDR)
                            </Label>
                            <Input
                                id="spend"
                                type="number"
                                value={editForm.spend}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, spend: e.target.value })
                                }
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="impressions" className="text-right">
                                Impressions
                            </Label>
                            <Input
                                id="impressions"
                                type="number"
                                value={editForm.impressions}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, impressions: e.target.value })
                                }
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="clicks" className="text-right">
                                Clicks
                            </Label>
                            <Input
                                id="clicks"
                                type="number"
                                value={editForm.clicks}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, clicks: e.target.value })
                                }
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="reach" className="text-right">
                                Reach
                            </Label>
                            <Input
                                id="reach"
                                type="number"
                                value={editForm.reach}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, reach: e.target.value })
                                }
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEditOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit} disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the spend record for{" "}
                            <strong>{deletingLog?.campaignName}</strong>. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                confirmDelete();
                            }}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
