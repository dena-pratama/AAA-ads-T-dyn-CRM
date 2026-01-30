"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"

export type CampaignStat = {
    id: string
    name: string
    platform: string
    spend: number
    impressions: number
    clicks: number
    leads: number
    ctr: number
    cpc: number
    cpl: number
    roas: number
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value)
}

function formatNumber(value: number) {
    return new Intl.NumberFormat("id-ID").format(value)
}

function formatPercent(value: number) {
    return `${value.toFixed(2)}%`
}

export const columns: ColumnDef<CampaignStat>[] = [
    {
        accessorKey: "name",
        header: "Campaign Name",
        cell: ({ row }) => (
            <div className="font-medium min-w-[200px]">{row.getValue("name")}</div>
        ),
    },
    {
        accessorKey: "platform",
        header: "Platform",
        cell: ({ row }) => {
            const platform = (row.getValue("platform") as string).toUpperCase()
            let color = "bg-slate-500"
            if (platform === "META" || platform === "FACEBOOK" || platform === "INSTAGRAM") color = "bg-blue-600"
            if (platform === "GOOGLE") color = "bg-red-500"
            if (platform === "TIKTOK") color = "bg-black dark:bg-slate-700"

            return <Badge className={`${color} text-white hover:${color}`}>{platform}</Badge>
        },
    },
    {
        accessorKey: "spend",
        header: "Spend",
        cell: ({ row }) => formatCurrency(row.getValue("spend")),
        enableHiding: false,
    },
    {
        accessorKey: "impressions",
        header: "Impressions",
        cell: ({ row }) => formatNumber(row.getValue("impressions")),
    },
    {
        accessorKey: "clicks",
        header: "Clicks",
        cell: ({ row }) => formatNumber(row.getValue("clicks")),
    },
    {
        accessorKey: "ctr",
        header: "CTR",
        cell: ({ row }) => formatPercent(row.getValue("ctr")),
    },
    {
        accessorKey: "cpc",
        header: "CPC",
        cell: ({ row }) => formatCurrency(row.getValue("cpc")),
    },
    {
        accessorKey: "leads",
        header: "Leads",
        cell: ({ row }) => (
            <span className="font-bold text-green-600 dark:text-green-400">
                {formatNumber(row.getValue("leads"))}
            </span>
        ),
    },
    {
        accessorKey: "cpl",
        header: "CPL",
        cell: ({ row }) => {
            const val = row.getValue("cpl") as number
            return val > 0 ? formatCurrency(val) : "-"
        },
    },
]

interface CampaignPerformanceTableProps {
    data: CampaignStat[]
    stages?: { id: string; name: string; color: string }[]
}

export function CampaignPerformanceTable({ data, stages = [] }: CampaignPerformanceTableProps) {
    // Create dynamic columns for stages
    const stageColumns: ColumnDef<CampaignStat>[] = stages.map((stage) => ({
        id: `stage_${stage.id}`,
        header: stage.name,
        accessorFn: (row) => {
            // Access nested breakdown if available
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const breakdown = (row as any).breakdown || {};
            return breakdown[stage.id] || 0;
        },
        cell: ({ getValue }) => (
            <div className="text-center font-medium text-slate-600 dark:text-slate-400">
                {formatNumber(getValue() as number)}
            </div>
        ),
    }));

    // Combine standard columns with dynamic stage columns
    // Insert stage columns after "Leads" (index 7)
    const tableColumns = [
        ...columns.slice(0, 8),
        ...stageColumns,
        ...columns.slice(8),
    ];

    return (
        <DataTable columns={tableColumns} data={data} searchKey="name" />
    )
}
