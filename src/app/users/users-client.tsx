"use client"

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { User, getColumns } from "./columns";
import { UserDialog } from "@/components/users/user-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
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

interface UsersClientProps {
    data: User[];
}

export function UsersClient({ data }: UsersClientProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    // Alert Dialog State
    const [alertOpen, setAlertOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const router = useRouter();

    const handleEdit = (user: User) => {
        setUserToEdit(user);
        setDialogOpen(true);
    };

    const confirmDelete = (user: User) => {
        setUserToDelete(user);
        setAlertOpen(true);
    };

    const executeDelete = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/users/${userToDelete.id}`, { method: "DELETE" });
            if (res.ok) {
                router.refresh();
                setAlertOpen(false);
            } else {
                const errorText = await res.text();
                alert(errorText || "Failed to delete user");
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCreate = () => {
        setUserToEdit(null);
        setDialogOpen(true);
    };

    const columns = getColumns({ onEdit: handleEdit, onDelete: confirmDelete });

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage user access and roles</p>
                </div>

                <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-1">
                <DataTable columns={columns} data={data} searchKey="name" />
            </div>

            <UserDialog open={dialogOpen} setOpen={setDialogOpen} userToEdit={userToEdit} />

            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user account for
                            <span className="font-bold text-slate-900 dark:text-white"> {userToDelete?.name} </span>.
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
                            Delete User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
