"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Define the shape of our data
export type User = {
    id: string
    name: string | null
    email: string
    role: "SUPER_ADMIN" | "CLIENT_ADMIN" | "CS"
    isActive: boolean
    clientId: string | null
    clientName: string
    image: string | null
    createdAt: string
}

interface UserColumnsProps {
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
}

export const getColumns = ({ onEdit, onDelete }: UserColumnsProps): ColumnDef<User>[] => [
    {
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => {
            const user = row.original;
            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-800">
                        <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                        <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                            {user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium text-slate-900 dark:text-white text-sm">{user.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{user.email}</span>
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            const role = row.getValue("role") as string
            let variant: "default" | "secondary" | "destructive" | "outline" = "outline";

            if (role === "SUPER_ADMIN") variant = "destructive";
            else if (role === "CLIENT_ADMIN") variant = "default";
            else variant = "secondary";

            return <Badge variant={variant} className="text-[10px]">{role.replace("_", " ")}</Badge>
        },
    },
    {
        accessorKey: "clientName",
        header: "Client",
        cell: ({ row }) => {
            const user = row.original;
            if (user.role === "SUPER_ADMIN") return <span className="text-slate-400 text-xs italic">Global</span>;
            return <span className="text-sm font-medium">{user.clientName}</span>;
        }
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.getValue("isActive")
            return (
                <Badge variant={isActive ? "outline" : "secondary"} className={isActive ? "border-green-500/50 text-green-600 dark:text-green-400 bg-green-500/10" : "text-slate-500"}>
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const user = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(user)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => onDelete(user)}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete User
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
