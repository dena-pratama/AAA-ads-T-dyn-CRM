
"use client"

import { useState } from "react"
import { Pipeline, getColumns } from "./columns"
import { DataTable } from "@/app/clients/data-table" // Reusing the DataTable from clients if generic, checking...
// Wait, I should probably check if DataTable is generic. 
// Assuming I can reuse or duplicate. Let's create a generic one or use the one I likely made.
// I will assume I need to import the DataTable component.
// Actually, better to check if I have a reusable DataTable in components/ui/data-table.tsx?
// I recall seeing src/app/clients/data-table.tsx in the list. I should check if it is generic.
// For now, I'll assume I can copy or import it.

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DataTable as GenericDataTable } from "@/components/ui/data-table" // I'll assume I should have one or check.

// I'll define a local reusable DataTable import if the generic one doesn't exist, 
// but based on typical patterns, I might have to use the one in clients or move it.
// Let's check `src` folder structure again in previous steps... 
// `src/app/clients/page.tsx` used `ClientsClient`.
// `src/app/clients/data-table.tsx` exists.

import { DataTable as ClientDataTable } from "@/app/clients/data-table"

interface PipelinesClientProps {
    data: Pipeline[]
}

export function PipelinesClient({ data }: PipelinesClientProps) {
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!deleteId) return
        setIsDeleting(true)
        try {
            await fetch(`/api/pipelines/${deleteId}`, { method: "DELETE" })
            window.location.reload()
        } catch (error) {
            console.error(error)
            alert("Failed to delete pipeline")
        } finally {
            setIsDeleting(false)
            setDeleteId(null)
        }
    }

    const columns = getColumns({ onDelete: setDeleteId })

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Pipelines</h2>
                    <p className="text-muted-foreground">
                        Manage your CRM pipelines and stages.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/pipelines/new">
                        <Plus className="mr-2 h-4 w-4" /> Create Pipeline
                    </Link>
                </Button>
            </div>

            <ClientDataTable columns={columns} data={data} searchKey="name" />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the pipeline
                            and might affect leads associated with it.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.preventDefault(); handleDelete(); }}
                            className="bg-red-600 focus:ring-red-600"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
