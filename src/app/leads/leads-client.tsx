"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Upload, Plus, ArrowLeft, Loader2, Search, List as ListIcon, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { getColumns, Lead } from "@/components/leads/columns";
import { LeadForm } from "@/components/leads/lead-form";
import { LeadsChart } from "@/components/leads/leads-chart";
import { toast } from "sonner";

interface Pipeline {
    id: string;
    name: string;
    stages: { id: string; name: string; color: string }[];
}

interface LeadsClientProps {
    pipelines: Pipeline[];
}

export function LeadsClient({ pipelines }: LeadsClientProps) {
    // const router = useRouter(); // Removed unused router
    const [mounted, setMounted] = useState(false);
    const [selectedPipelineId, setSelectedPipelineId] = useState<string>("");

    useEffect(() => {
        setMounted(true);
    }, []);

    // ... (other state)

    // Initialize pipeline selection
    useEffect(() => {
        if (pipelines.length > 0 && !selectedPipelineId && pipelines[0]) {
            setSelectedPipelineId(pipelines[0].id);
        }
    }, [pipelines, selectedPipelineId]);

    // ... (fetchLeads callback)

    // ... (other effects)


    // const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);

    // View state
    const [view, setView] = useState<"list" | "chart">("list");

    // Edit/Delete state (reused for both views)
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [leadToEdit, setLeadToEdit] = useState<Lead | undefined>(undefined);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Data state
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(false);
    const [stageFilter, setStageFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    // Initialize pipeline selection (moved to avoid conditional hook)
    useEffect(() => {
        if (pipelines.length > 0 && !selectedPipelineId && pipelines[0]) {
            setSelectedPipelineId(pipelines[0].id);
        }
    }, [pipelines, selectedPipelineId]);

    const fetchLeads = useCallback(async () => {
        if (!selectedPipelineId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/leads?pipelineId=${selectedPipelineId}`);
            if (res.ok) {
                const data = await res.json();
                setLeads(data);
            }
        } catch (error) {
            console.error("Failed to fetch leads", error);
        } finally {
            setLoading(false);
        }
    }, [selectedPipelineId]);

    // Fetch leads when pipeline changes
    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const handleEdit = (lead: Lead) => {
        setLeadToEdit(lead);
        setIsEditOpen(true);
    };

    const confirmDelete = (lead: Lead) => {
        setLeadToDelete(lead);
        setDeleteOpen(true);
    };

    const executeDelete = async () => {
        if (!leadToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/leads/${leadToDelete.id}`, { method: "DELETE" });
            if (res.ok) {
                setLeads(prev => prev.filter(l => l.id !== leadToDelete.id));
                setDeleteOpen(false);
                toast.success("Lead deleted");
            } else {
                toast.error("Failed to delete lead");
            }
        } catch (e) {
            console.error(e);
            toast.error("An error occurred");
        } finally {
            setIsDeleting(false);
        }
    };

    if (!mounted) {
        return null;
    }

    // Filter leads
    const filteredLeads = leads.filter(lead => {
        const matchesStage = stageFilter === "all" || lead.stageId === stageFilter;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            lead.customerName.toLowerCase().includes(searchLower) ||
            lead.phone.includes(searchLower) ||
            (lead.email && lead.email.toLowerCase().includes(searchLower));
        return matchesStage && matchesSearch;
    });

    const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId);
    const columns = getColumns({ onEdit: handleEdit, onDelete: confirmDelete });

    return (
        <div className="space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
                        <p className="text-muted-foreground">
                            Manage and track your potential customers.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* View Toggle */}
                    <div className="flex items-center p-1 bg-muted rounded-lg">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setView("list")}
                            className={`h-8 px-3 text-xs ${view === "list" ? "bg-background shadow-sm hover:bg-background" : "hover:bg-transparent"}`}
                        >
                            <ListIcon className="h-4 w-4 mr-2" />
                            List
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setView("chart")}
                            className={`h-8 px-3 text-xs ${view === "chart" ? "bg-background shadow-sm hover:bg-background" : "hover:bg-transparent"}`}
                        >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Chart
                        </Button>
                    </div>

                    {/* Add Lead Dialog */}
                    <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
                        <DialogTrigger asChild>
                            <Button variant="default">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Lead
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Add New Lead</DialogTitle>
                                <DialogDescription>
                                    Enter details for the new lead manually.
                                </DialogDescription>
                            </DialogHeader>
                            <LeadForm
                                pipelines={pipelines}
                                defaultPipelineId={selectedPipelineId}
                                onSuccess={() => {
                                    setIsAddLeadOpen(false);
                                    fetchLeads();
                                    toast.success("Lead created successfully");
                                }}
                            />
                        </DialogContent>
                    </Dialog>

                    {/* Import Trigger */}
                    <Button variant="outline" onClick={() => toast.info("Import feature coming soon")}>
                        <Upload className="mr-2 h-4 w-4" />
                        Import
                    </Button>
                </div>
            </div>

            {/* Pipeline Selector and Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
                    <div className="w-full md:w-[250px]">
                        <Select value={selectedPipelineId} onValueChange={setSelectedPipelineId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Pipeline" />
                            </SelectTrigger>
                            <SelectContent>
                                {pipelines.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full md:w-[200px]">
                        <Select value={stageFilter} onValueChange={setStageFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Stage" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Stages</SelectItem>
                                {selectedPipeline?.stages.map(stage => (
                                    <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="relative w-full md:w-[300px]">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <>
                    {view === "list" ? (
                        <DataTable
                            columns={columns}
                            data={filteredLeads}
                        />
                    ) : (
                        <LeadsChart
                            stages={selectedPipeline?.stages || []}
                            leads={filteredLeads}
                        />
                    )}
                </>
            )}

            {/* Edit Dialog (Reused) */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Lead</DialogTitle>
                    </DialogHeader>
                    {leadToEdit && (
                        <LeadForm
                            pipelines={pipelines}
                            leadToEdit={leadToEdit}
                            onSuccess={() => {
                                setIsEditOpen(false);
                                setLeadToEdit(undefined);
                                fetchLeads();
                                toast.success("Lead updated");
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Alert (Reused) */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the lead
                            for {leadToDelete?.customerName}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                executeDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
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
