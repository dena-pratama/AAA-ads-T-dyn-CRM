"use client"

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Client, getColumns } from "./columns";
import { ClientDialog } from "@/components/clients/client-dialog";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
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
import { Loader2 } from "lucide-react";

interface ClientsClientProps {
    data: Client[];
    canManage?: boolean;
}

export function ClientsClient({ data, canManage = false }: ClientsClientProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

    // Alert Dialog State
    const [alertOpen, setAlertOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const router = useRouter();

    const handleEdit = (client: Client) => {
        setClientToEdit(client);
        setDialogOpen(true);
    };

    const confirmDelete = (client: Client) => {
        setClientToDelete(client);
        setAlertOpen(true);
    }

    const executeDelete = async () => {
        if (!clientToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/clients/${clientToDelete.id}`, { method: "DELETE" });
            if (res.ok) {
                router.refresh();
                setAlertOpen(false);
            } else {
                const errorText = await res.text();
                alert(errorText || "Failed to delete client");
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCreate = () => {
        setClientToEdit(null);
        setDialogOpen(true);
    };

    const columns = getColumns({ onEdit: handleEdit, onDelete: confirmDelete, canManage });

    return (
        <>
            <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Client Management</h2>
            </div>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="text-slate-500 dark:text-slate-400">Manage your tenants and client accounts</p>
                </div>

                {canManage && (
                    <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Client
                    </Button>
                )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-1">
                <DataTable columns={columns} data={data} searchKey="name" />
            </div>

            <ClientDialog open={dialogOpen} setOpen={setDialogOpen} clientToEdit={clientToEdit} />

            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the client
                            <span className="font-bold text-slate-900 dark:text-white"> {clientToDelete?.name} </span>
                            and remove all associated data (Users, Campaigns, Pipelines).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                executeDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
