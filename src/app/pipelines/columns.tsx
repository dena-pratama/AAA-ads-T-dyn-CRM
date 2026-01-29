
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash, Eye } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"


export type Pipeline = {
    id: string
    name: string
    description: string | null
    isDefault: boolean
    isActive: boolean
    createdAt: string
    client: {
        name: string
    }
}

export interface PipelineColumnsProps {
    onDelete: (id: string) => void
    canManage: boolean
}

export const getColumns = ({ onDelete, canManage }: PipelineColumnsProps): ColumnDef<Pipeline>[] => [
    {
        accessorKey: "name",
        header: "Pipeline Name",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <Link
                    href={`/pipelines/${row.original.id}/flow`}
                    className="font-medium hover:underline hover:text-blue-500 transition-colors"
                >
                    {row.getValue("name")}
                </Link>
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {row.original.description}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "client.name",
        header: "Client",
    },
    {
        accessorKey: "isDefault",
        header: "Default",
        cell: ({ row }) => (
            row.getValue("isDefault") ? (
                <Badge variant="outline" className="border-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-900/20">
                    Default
                </Badge>
            ) : null
        ),
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant={row.getValue("isActive") ? "default" : "secondary"}>
                {row.getValue("isActive") ? "Active" : "Inactive"}
            </Badge>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const pipeline = row.original

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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/pipelines/${pipeline.id}`} className="flex items-center cursor-pointer">
                                {canManage ? (
                                    <>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit Pipeline
                                    </>
                                ) : (
                                    <>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Pipeline
                                    </>
                                )}
                            </Link>
                        </DropdownMenuItem>
                        {canManage && (
                            <DropdownMenuItem
                                onClick={() => onDelete(pipeline.id)}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
