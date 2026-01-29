"use client";

import { useState } from "react";
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
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Upload, Plus, FileSpreadsheet, ArrowLeft } from "lucide-react";

interface Pipeline {
    id: string;
    name: string;
}

interface LeadsClientProps {
    pipelines: Pipeline[];
    canManage: boolean;
}

export function LeadsClient({ pipelines, canManage }: LeadsClientProps) {
    const router = useRouter();
    const [selectedPipelineId, setSelectedPipelineId] = useState<string>("");
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

    const handleImport = () => {
        if (!selectedPipelineId) return;
        router.push(`/pipelines/${selectedPipelineId}/import`);
    };

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
                    <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
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
                    {/* Add manual lead button placeholder */}
                    <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Lead
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Leads</CardTitle>
                    <CardDescription>
                        A unified view of leads across all pipelines. (Coming soon)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg text-muted-foreground">
                        <FileSpreadsheet className="h-10 w-10 mb-4 opacity-50" />
                        <p className="text-lg font-medium">Data Grid Module</p>
                        <p className="text-sm">Will be implemented in Phase 3</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
