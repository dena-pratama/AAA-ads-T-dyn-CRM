"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

export interface SpendLog {
    id: string;
    date: string;
    platform: string;
    campaignName: string;
    spend: number;
    impressions: number;
    clicks: number;
    reach: number;
    campaign?: {
        id: string;
        name: string;
    } | null;
    client?: {
        id: string;
        name: string;
    } | null;
}

const platformColors: Record<string, string> = {
    META: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    GOOGLE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    TIKTOK: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
    SHOPEE: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    TOKOPEDIA: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    LAZADA: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

interface ColumnOptions {
    onEdit: (row: SpendLog) => void;
    onDelete: (row: SpendLog) => void;
}

export function getSpendColumns({ onEdit, onDelete }: ColumnOptions): ColumnDef<SpendLog>[] {
    return [
        {
            accessorKey: "date",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const date = new Date(row.getValue("date"));
                return <span className="font-medium">{format(date, "dd MMM yyyy")}</span>;
            },
        },
        {
            accessorKey: "platform",
            header: "Platform",
            cell: ({ row }) => {
                const platform = row.getValue("platform") as string;
                return (
                    <Badge className={platformColors[platform] || platformColors.OTHER}>
                        {platform}
                    </Badge>
                );
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "campaignName",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Campaign
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const campaign = row.original.campaign;
                return (
                    <div className="max-w-[200px] truncate">
                        {campaign?.name || row.getValue("campaignName")}
                    </div>
                );
            },
        },
        {
            accessorKey: "spend",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="justify-end w-full"
                >
                    Spend
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const spend = parseFloat(row.getValue("spend"));
                const formatted = new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                }).format(spend);
                return <div className="text-right font-medium">{formatted}</div>;
            },
        },
        {
            accessorKey: "impressions",
            header: () => <div className="text-right">Impressions</div>,
            cell: ({ row }) => {
                const value = row.getValue("impressions") as number;
                return <div className="text-right">{value.toLocaleString("id-ID")}</div>;
            },
        },
        {
            accessorKey: "clicks",
            header: () => <div className="text-right">Clicks</div>,
            cell: ({ row }) => {
                const value = row.getValue("clicks") as number;
                return <div className="text-right">{value.toLocaleString("id-ID")}</div>;
            },
        },
        {
            accessorKey: "reach",
            header: () => <div className="text-right">Reach</div>,
            cell: ({ row }) => {
                const value = row.getValue("reach") as number;
                return <div className="text-right">{value.toLocaleString("id-ID")}</div>;
            },
        },
        {
            id: "ctr",
            header: () => <div className="text-right">CTR</div>,
            cell: ({ row }) => {
                const impressions = row.getValue("impressions") as number;
                const clicks = row.getValue("clicks") as number;
                const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : "0.00";
                return <div className="text-right">{ctr}%</div>;
            },
        },
        {
            id: "cpc",
            header: () => <div className="text-right">CPC</div>,
            cell: ({ row }) => {
                const spend = parseFloat(row.getValue("spend"));
                const clicks = row.getValue("clicks") as number;
                const cpc = clicks > 0 ? spend / clicks : 0;
                const formatted = new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                }).format(cpc);
                return <div className="text-right">{formatted}</div>;
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                return (
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(row.original)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(row.original)}
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                );
            },
        },
    ];
}
