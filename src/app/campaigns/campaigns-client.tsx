"use client"

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { getColumns, Campaign } from "@/app/campaigns/columns";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Merge, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface Client {
    id: string;
    name: string;
}

interface CampaignsClientProps {
    data: Campaign[];
    clients: Client[];
    isSuperAdmin: boolean;
}

export function CampaignsClient({ data, clients, isSuperAdmin }: CampaignsClientProps) {
    const [campaigns, setCampaigns] = useState(data);
    const [filterClient, setFilterClient] = useState<string>("all");

    // Edit dialog
    const [editOpen, setEditOpen] = useState(false);
    const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
    const [editName, setEditName] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    // Delete alert
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteCampaign, setDeleteCampaign] = useState<Campaign | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Merge dialog
    const [mergeOpen, setMergeOpen] = useState(false);
    const [mergeTarget, setMergeTarget] = useState<string>("");
    const [mergeSources, setMergeSources] = useState<string[]>([]);
    const [isMerging, setIsMerging] = useState(false);

    const router = useRouter();

    // Filter campaigns
    const filteredCampaigns = filterClient === "all"
        ? campaigns
        : campaigns.filter(c => c.clientId === filterClient);

    const handleEdit = (campaign: Campaign) => {
        setEditCampaign(campaign);
        setEditName(campaign.name);
        setEditOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editCampaign) return;
        setIsEditing(true);
        try {
            const res = await fetch(`/api/campaigns/${editCampaign.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName })
            });
            if (res.ok) {
                setCampaigns(prev => prev.map(c =>
                    c.id === editCampaign.id ? { ...c, name: editName } : c
                ));
                setEditOpen(false);
                toast.success("Campaign updated");
            } else {
                toast.error("Failed to update campaign");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setIsEditing(false);
        }
    };

    const handleToggleActive = async (campaign: Campaign) => {
        try {
            const res = await fetch(`/api/campaigns/${campaign.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !campaign.isActive })
            });
            if (res.ok) {
                setCampaigns(prev => prev.map(c =>
                    c.id === campaign.id ? { ...c, isActive: !c.isActive } : c
                ));
                toast.success(`Campaign ${campaign.isActive ? "deactivated" : "activated"}`);
            }
        } catch {
            toast.error("Failed to toggle status");
        }
    };

    const confirmDelete = (campaign: Campaign) => {
        setDeleteCampaign(campaign);
        setDeleteOpen(true);
    };

    const executeDelete = async () => {
        if (!deleteCampaign) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/campaigns/${deleteCampaign.id}`, { method: "DELETE" });
            if (res.ok) {
                setCampaigns(prev => prev.filter(c => c.id !== deleteCampaign.id));
                setDeleteOpen(false);
                toast.success("Campaign deleted");
            } else {
                toast.error("Failed to delete campaign");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setIsDeleting(false);
        }
    };

    const openMergeDialog = () => {
        setMergeTarget("");
        setMergeSources([]);
        setMergeOpen(true);
    };

    const toggleMergeSource = (id: string) => {
        setMergeSources(prev =>
            prev.includes(id)
                ? prev.filter(s => s !== id)
                : [...prev, id]
        );
    };

    const executeMerge = async () => {
        if (!mergeTarget || mergeSources.length === 0) {
            toast.error("Select target and source campaigns");
            return;
        }
        if (mergeSources.includes(mergeTarget)) {
            toast.error("Target cannot be a source");
            return;
        }
        setIsMerging(true);
        try {
            const res = await fetch("/api/campaigns/merge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetId: mergeTarget, sourceIds: mergeSources })
            });
            if (res.ok) {
                router.refresh();
                setMergeOpen(false);
                toast.success("Campaigns merged successfully");
            } else {
                toast.error("Failed to merge campaigns");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setIsMerging(false);
        }
    };

    const columns = getColumns({
        onEdit: handleEdit,
        onDelete: confirmDelete,
        onToggleActive: handleToggleActive
    });

    return (
        <div className="space-y-6 p-8 pt-6">
            <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">Campaigns</h1>
                    <p className="text-muted-foreground text-sm">Manage campaign names, merge duplicates</p>
                </div>
                <Button variant="outline" onClick={openMergeDialog}>
                    <Merge className="h-4 w-4 mr-2" />
                    Merge
                </Button>
            </div>

            {/* Filters */}
            {isSuperAdmin && clients.length > 0 && (
                <div className="flex items-center gap-4 mb-4">
                    <Select value={filterClient} onValueChange={setFilterClient}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Filter by client" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Clients</SelectItem>
                            {clients.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Badge variant="secondary">{filteredCampaigns.length} campaigns</Badge>
                </div>
            )}

            <DataTable
                columns={columns}
                data={filteredCampaigns}
                searchKey="name"
            />

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Campaign</DialogTitle>
                        <DialogDescription>
                            Original name: {editCampaign?.originalName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="name">Display Name</Label>
                        <Input
                            id="name"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="mt-2"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit} disabled={isEditing}>
                            {isEditing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete &quot;{deleteCampaign?.name}&quot; and unlink all associated spend logs and leads.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={executeDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Merge Dialog */}
            <Dialog open={mergeOpen} onOpenChange={setMergeOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Merge Campaigns</DialogTitle>
                        <DialogDescription>
                            Select a target campaign and source campaigns to merge. All spend logs and leads will be moved to target.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div>
                            <Label>Target Campaign (keep)</Label>
                            <Select value={mergeTarget} onValueChange={setMergeTarget}>
                                <SelectTrigger className="mt-2">
                                    <SelectValue placeholder="Select target..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredCampaigns.map(c => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Source Campaigns (delete after merge)</Label>
                            <div className="mt-2 max-h-48 overflow-y-auto border rounded-md p-2 space-y-2">
                                {filteredCampaigns
                                    .filter(c => c.id !== mergeTarget)
                                    .map(c => (
                                        <div key={c.id} className="flex items-center gap-2">
                                            <Checkbox
                                                id={c.id}
                                                checked={mergeSources.includes(c.id)}
                                                onCheckedChange={() => toggleMergeSource(c.id)}
                                            />
                                            <label htmlFor={c.id} className="text-sm flex-1 cursor-pointer">
                                                {c.name}
                                                <span className="text-muted-foreground ml-2">
                                                    ({c.spendCount} spend, {c.leadCount} leads)
                                                </span>
                                            </label>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setMergeOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={executeMerge} disabled={isMerging || !mergeTarget || mergeSources.length === 0}>
                            {isMerging && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Merge {mergeSources.length > 0 && `(${mergeSources.length})`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
