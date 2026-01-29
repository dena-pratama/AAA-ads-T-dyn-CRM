"use client"

import { useState } from "react"
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { KanbanCard } from "./kanban-card"
import { Lead } from "./columns"
import { toast } from "sonner"
import { Phone, User } from "lucide-react"

interface Stage {
    id: string
    name: string
    color: string
}

interface KanbanBoardProps {
    stages: Stage[]
    leads: Lead[]
    onStageChange: (leadId: string, newStageId: string) => Promise<void>
}

export function KanbanBoard({ stages, leads, onStageChange }: KanbanBoardProps) {
    const [activeId, setActiveId] = useState<string | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    )

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)

        if (!over) return

        const leadId = active.id as string
        const newStageId = over.id as string

        const lead = leads.find(l => l.id === leadId)
        if (!lead) return

        if (lead.stageId === newStageId) return

        try {
            await onStageChange(leadId, newStageId)
            toast.success("Lead stage updated")
        } catch (error) {
            toast.error("Failed to update lead stage")
            console.error(error)
        }
    }

    const activeLead = activeId ? leads.find(l => l.id === activeId) : null

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-[calc(100vh-220px)] overflow-x-auto pb-4 gap-4">
                {stages.map((stage) => {
                    const stageLeads = leads.filter(l => l.stageId === stage.id)
                    return (
                        <SortableContext
                            key={stage.id}
                            id={stage.id}
                            items={stageLeads.map(l => l.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="flex-shrink-0 w-80 flex flex-col bg-muted/50 rounded-xl border border-border/50">
                                <div className="p-3 pb-2 flex items-center justify-between sticky top-0 bg-muted/50 backdrop-blur-sm rounded-t-xl z-10">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-2 w-2 rounded-full"
                                            style={{ backgroundColor: stage.color }}
                                        />
                                        <h3 className="font-semibold text-sm">{stage.name}</h3>
                                    </div>
                                    <Badge variant="secondary" className="text-xs bg-background">
                                        {stageLeads.length}
                                    </Badge>
                                </div>

                                <CardContent className="flex-1 overflow-y-auto p-2 pt-0 space-y-2 min-h-0 custom-scrollbar">
                                    {stageLeads.map((lead) => (
                                        <KanbanCard
                                            key={lead.id}
                                            lead={lead}
                                            stageColor={stage.color}
                                        />
                                    ))}
                                    {stageLeads.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 border-2 border-dashed border-muted-foreground/10 rounded-lg m-1">
                                            <span className="text-xs font-medium">Empty</span>
                                        </div>
                                    )}
                                </CardContent>
                            </div>
                        </SortableContext>
                    )
                })}
            </div>

            <DragOverlay>
                {activeLead ? (
                    <Card className="w-full max-w-sm opacity-90 rotate-3 shadow-2xl">
                        <CardContent className="p-3 space-y-2.5">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm truncate">{activeLead.customerName}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">
                                            {new Date(activeLead.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5 pt-1">
                                {activeLead.phone && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Phone className="h-3 w-3" />
                                        <span className="truncate">{activeLead.phone}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}
