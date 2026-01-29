"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Lead } from "./columns"
import { Phone, Mail, User } from "lucide-react"

interface KanbanCardProps {
    lead: Lead
    stageColor: string
}

export function KanbanCard({ lead, stageColor }: KanbanCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: lead.id,
        data: {
            type: "Lead",
            lead,
        },
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="group relative cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 border-border/50 hover:border-primary/20 bg-card"
        >
            <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl opacity-0 transition-opacity group-hover:opacity-100"
                style={{ backgroundColor: stageColor }}
            />
            <CardContent className="p-3 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                            <User className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{lead.customerName}</p>
                            <p className="text-[10px] text-muted-foreground truncate">
                                {new Date(lead.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5 pt-1">
                    {lead.phone && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                            <Phone className="h-3 w-3" />
                            <span className="truncate">{lead.phone}</span>
                        </div>
                    )}

                    {lead.email && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{lead.email}</span>
                        </div>
                    )}
                </div>

                {lead.campaignName && (
                    <div className="pt-1 flex flex-wrap gap-1">
                        <span className="text-[10px] px-2 py-0.5 bg-secondary/50 rounded-full truncate max-w-full text-secondary-foreground border border-border/50">
                            {lead.campaignName}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
