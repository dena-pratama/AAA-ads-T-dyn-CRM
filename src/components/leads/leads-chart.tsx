"use client"

import { useMemo } from "react"
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Cell
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lead } from "./columns"

interface LeadsChartProps {
    stages: { id: string; name: string; color: string }[]
    leads: Lead[]
}

export function LeadsChart({ stages, leads }: LeadsChartProps) {
    const data = useMemo(() => {
        return stages.map((stage) => {
            const count = leads.filter((lead) => lead.stageId === stage.id).length
            return {
                name: stage.name,
                count,
                color: stage.color,
            }
        })
    }, [stages, leads])

    const totalLeads = leads.length

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Pipeline Overview</CardTitle>
                <CardDescription>
                    Distribution of {totalLeads} leads across {stages.length} stages
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                                allowDecimals={false}
                            />
                            <Tooltip
                                cursor={{ fill: "transparent" }}
                                contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    borderColor: "hsl(var(--border))",
                                    borderRadius: "var(--radius)",
                                }}
                                itemStyle={{ color: "hsl(var(--foreground))" }}
                            />
                            <Bar
                                dataKey="count"
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color || "hsl(var(--primary))"} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
