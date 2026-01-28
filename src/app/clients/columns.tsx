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

// Define the shape of our data
export type Client = {
    id: string
    name: string
    slug: string
    currency: string
    description?: string | null
    isActive: boolean
    createdAt: string
    _count: {
        users: number
        campaigns: number
        pipelines: number
    }
}

interface ClientColumnsProps {
    onEdit: (client: Client) => void;
    onDelete: (client: Client) => void;
    canManage: boolean;
}

export const getColumns = ({ onEdit, onDelete, canManage }: ClientColumnsProps): ColumnDef<Client>[] => [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium">{row.getValue("name")}</span>
                {row.original.description && (
                    <span className="text-xs text-slate-500 truncate max-w-[200px]">{row.original.description}</span>
                )}
            </div>
        )
    },
    {
        accessorKey: "slug",
        header: "Id-Client",
        cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("slug")}</span>,
    },
    {
        accessorKey: "currency",
        header: "Business Model",
    },
    {
        accessorKey: "_count.users",
        header: "Handler",
        cell: ({ row }) => row.original._count?.users || 0,
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
            const client = row.original

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
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(client.id)}>
                            Copy ID
                        </DropdownMenuItem>
                        {canManage && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onEdit(client)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit Client
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => onDelete(client)}>
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete Client
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
