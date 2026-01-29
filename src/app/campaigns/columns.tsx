"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react"

export interface Campaign {
    id: string
    name: string
    originalName: string
    platform: string
    isActive: boolean
    clientId: string
    clientName: string
    aliases: string[]
    spendCount: number
    leadCount: number
    createdAt: string
}

interface ColumnOptions {
    onEdit: (campaign: Campaign) => void
    onDelete: (campaign: Campaign) => void
    onToggleActive: (campaign: Campaign) => void
}

const platformColors: Record<string, string> = {
    META: "bg-blue-500",
    GOOGLE: "bg-red-500",
    TIKTOK: "bg-pink-500",
    SHOPEE: "bg-orange-500",
    TOKOPEDIA: "bg-green-500",
    LAZADA: "bg-purple-500",
    OTHER: "bg-gray-500",
}

export function getColumns({ onEdit, onDelete, onToggleActive }: ColumnOptions): ColumnDef<Campaign>[] {
    return [
        {
            accessorKey: "name",
            header: "Campaign Name",
            cell: ({ row }) => {
                const name = row.original.name
                const original = row.original.originalName
                const isRenamed = name !== original
                return (
                    <div>
                        <span className="font-medium">{name}</span>
                        {isRenamed && (
                            <p className="text-xs text-muted-foreground">
                                (was: {original})
                            </p>
                        )}
                    </div>
                )
            }
        },
        {
            accessorKey: "platform",
            header: "Platform",
            cell: ({ row }) => {
                const platform = row.original.platform
                return (
                    <Badge className={`${platformColors[platform] || "bg-gray-500"} text-white`}>
                        {platform}
                    </Badge>
                )
            }
        },
        {
            accessorKey: "clientName",
            header: "Client",
        },
        {
            accessorKey: "spendCount",
            header: "Spend Logs",
            cell: ({ row }) => (
                <span className="text-muted-foreground">{row.original.spendCount}</span>
            )
        },
        {
            accessorKey: "leadCount",
            header: "Leads",
            cell: ({ row }) => (
                <span className="text-muted-foreground">{row.original.leadCount}</span>
            )
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={row.original.isActive ? "default" : "secondary"}>
                    {row.original.isActive ? "Active" : "Inactive"}
                </Badge>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const campaign = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEdit(campaign)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onToggleActive(campaign)}>
                                {campaign.isActive ? (
                                    <>
                                        <ToggleLeft className="mr-2 h-4 w-4" />
                                        Deactivate
                                    </>
                                ) : (
                                    <>
                                        <ToggleRight className="mr-2 h-4 w-4" />
                                        Activate
                                    </>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onDelete(campaign)}
                                className="text-destructive"
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
