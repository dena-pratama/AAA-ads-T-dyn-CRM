
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"

export type Lead = {
    id: string
    customerName: string
    phone: string
    email?: string
    pipelineId: string
    stageId: string
    program?: string
    status: string
    createdAt: string
    pipeline?: { name: string }
    stage?: { name: string }
    campaignName?: string
    currentStage: string
    value?: number
}

interface ColumnOptions {
    onEdit: (lead: Lead) => void
    onDelete: (lead: Lead) => void
}

export function getColumns(options: ColumnOptions): ColumnDef<Lead>[] {
    return [
        {
            accessorKey: "customerName",
            header: "Name",
            cell: ({ row }) => <div className="font-medium">{row.getValue("customerName")}</div>
        },
        {
            accessorKey: "phone",
            header: "Contact",
            cell: ({ row }) => (
                <div className="flex flex-col text-xs">
                    <span>{row.original.phone}</span>
                </div>
            )
        },
        {
            accessorKey: "pipeline.name",
            header: "Pipeline",
            cell: ({ row }) => {
                return <Badge variant="outline">{row.original.pipeline?.name || "N/A"}</Badge>
            }
        },
        {
            accessorKey: "stage.name",
            header: "Stage",
            cell: ({ row }) => {
                return <Badge variant="secondary">{row.original.stage?.name || row.original.currentStage}</Badge>
            }
        },
        {
            accessorKey: "campaignName",
            header: "Campaign",
            cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.getValue("campaignName") || "-"}</span>
        },
        {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({ row }) => {
                return <span className="text-muted-foreground text-xs">
                    {format(new Date(row.getValue("createdAt")), "dd MMM yy HH:mm")}
                </span>
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const lead = row.original
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
                            <DropdownMenuItem onClick={() => options.onEdit(lead)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => options.onDelete(lead)}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        }
    ]
}
