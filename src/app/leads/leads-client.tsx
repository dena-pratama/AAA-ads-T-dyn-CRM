"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogFooter,
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
import { Upload, Plus, ArrowLeft, Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { getColumns, Lead } from "@/components/leads/columns";
import { LeadForm } from "@/components/leads/lead-form";

interface Pipeline {
    id: string;
    name: string;
    stages: { id: string; name: string }[];
}

interface LeadsClientProps {
    pipelines: Pipeline[];
}

export function LeadsClient({ pipelines }: LeadsClientProps) {
    const router = useRouter();
    const [selectedPipelineId, setSelectedPipelineId] = useState<string>("");
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);

    // Data State
    const [leads, setLeads] = useState<Lead[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Edit/Delete State
    const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null)
    const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Filter State
    const [filterPipelineId, setFilterPipelineId] = useState<string>("")
    const [filterStageId, setFilterStageId] = useState<string>("")
    const [searchQuery, setSearchQuery] = useState<string>("")

    // Get stages for selected pipeline filter
    const filterStages = pipelines.find(p => p.id === filterPipelineId)?.stages || []

    const fetchLeads = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            if (filterPipelineId) params.set("pipelineId", filterPipelineId)
            if (filterStageId) params.set("stageId", filterStageId)
            if (searchQuery) params.set("search", searchQuery)

            const url = `/api/leads${params.toString() ? `?${params.toString()}` : ""}`
            const res = await fetch(url)
            if (res.ok) {
                const data = await res.json()
                setLeads(data)
            }
        } catch (error) {
            console.error("Failed to fetch leads", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchLeads()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterPipelineId, filterStageId, searchQuery])

    const handleImport = () => {
        if (!selectedPipelineId) return;
        router.push(`/pipelines/${selectedPipelineId}/import`);
    };

    const handleEdit = (lead: Lead) => {
        setLeadToEdit(lead)
    }

    const handleDelete = (lead: Lead) => {
        setLeadToDelete(lead)
    }

    const executeDelete = async () => {
        if (!leadToDelete) return
        setIsDeleting(true)
        try {
            const res = await fetch(`/api/leads/${leadToDelete.id}`, { method: "DELETE" })
            if (res.ok) {
                setLeadToDelete(null)
                fetchLeads() // Refresh
            } else {
                alert("Failed to delete lead")
            }
        } catch (error) {
            console.error(error)
            alert("An error occurred")
        } finally {
            setIsDeleting(false)
        }
    }

    const columns = getColumns({ onEdit: handleEdit, onDelete: handleDelete })

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div className="flex flex-col gap-2">
                    <Button variant="ghost" size="sm" className="w-fit -ml-2 text-muted-foreground" onClick={() => router.push("/dashboard")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
                        <p className="text-muted-foreground">
                            Manage and track your potential customers.
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
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
                                    Manually enter a new lead into the CRM.
                                </DialogDescription>
                            </DialogHeader>
                            <LeadForm
                                pipelines={pipelines}
                                onSuccess={() => {
                                    setIsAddLeadOpen(false);
                                    fetchLeads(); // Refresh list
                                }}
                            />
                        </DialogContent>
                    </Dialog>

                    {/* Import Dialog */}
                    <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Upload className="mr-2 h-4 w-4" />
                                Import Leads
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Import Leads</DialogTitle>
                                <DialogDescription>
                                    Select the pipeline you want to import leads into.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Select onValueChange={setSelectedPipelineId} value={selectedPipelineId}>
                                        <SelectTrigger className="col-span-4">
                                            <SelectValue placeholder="Select Pipeline" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pipelines.map((p) => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleImport} disabled={!selectedPipelineId}>
                                    Continue to Import
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle>All Leads</CardTitle>
                            <CardDescription>
                                A unified view of leads across all pipelines.
                            </CardDescription>
                        </div>
                        {/* Filter Bar */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search name/phone..."
                                    className="pl-8 w-[200px]"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Pipeline Filter */}
                            <Select value={filterPipelineId || "all"} onValueChange={(val) => {
                                setFilterPipelineId(val === "all" ? "" : val)
                                setFilterStageId("") // Reset stage when pipeline changes
                            }}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="All Pipelines" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Pipelines</SelectItem>
                                    {pipelines.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Stage Filter (cascading) */}
                            <Select
                                value={filterStageId || "all"}
                                onValueChange={(val) => setFilterStageId(val === "all" ? "" : val)}
                                disabled={!filterPipelineId}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="All Stages" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Stages</SelectItem>
                                    {filterStages.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Clear Filters */}
                            {(filterPipelineId || filterStageId || searchQuery) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setFilterPipelineId("")
                                        setFilterStageId("")
                                        setSearchQuery("")
                                    }}
                                >
                                    <X className="mr-1 h-4 w-4" />
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-24">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <DataTable columns={columns} data={leads} searchKey="customerName" />
                    )}
                </CardContent>
            </Card>

            {/* Edit Lead Dialog */}
            <Dialog open={!!leadToEdit} onOpenChange={(open) => !open && setLeadToEdit(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Lead</DialogTitle>
                        <DialogDescription>
                            Update lead details.
                        </DialogDescription>
                    </DialogHeader>
                    {leadToEdit && (
                        <LeadForm
                            pipelines={pipelines}
                            leadToEdit={leadToEdit}
                            onSuccess={() => {
                                setLeadToEdit(null);
                                fetchLeads();
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!leadToDelete} onOpenChange={(open) => !open && setLeadToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the lead
                            <span className="font-semibold"> {leadToDelete?.customerName}</span>.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.preventDefault(); executeDelete(); }}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

