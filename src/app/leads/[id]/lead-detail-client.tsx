"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Save, Phone, Mail, User, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Stage {
    id: string;
    name: string;
    color: string;
    order: number;
    isGoal?: boolean;
}

interface StageHistoryItem {
    id: string;
    fromStage: string | null;
    toStage: string;
    movedAt: string;
    movedById: string | null;
}

interface Lead {
    id: string;
    customerName: string;
    phone: string;
    email: string | null;
    campaignName: string;
    currentStage: string;
    status: string;
    notes: string | null;
    csNumber: string | null;
    value: number | null;
    leadDate: string;
    createdAt: string;
    updatedAt: string;
    customData: Record<string, unknown>;
    client: { id: string; name: string };
    pipeline: { id: string; name: string; stages: Stage[] } | null;
    campaign: { id: string; name: string } | null;
    createdBy: { name: string | null; email: string | null } | null;
    updatedBy: { name: string | null; email: string | null } | null;
    stageHistory: StageHistoryItem[];
}

interface LeadDetailClientProps {
    lead: Lead;
}

export function LeadDetailClient({ lead: initialLead }: LeadDetailClientProps) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [lead, setLead] = useState(initialLead);
    const [saving, setSaving] = useState(false);

    // Editable fields
    const [notes, setNotes] = useState(lead.notes || "");
    const [value, setValue] = useState(lead.value?.toString() || "");
    const [selectedStage, setSelectedStage] = useState(lead.currentStage);

    useEffect(() => {
        setMounted(true);
    }, []);

    const stages = (lead.pipeline?.stages as Stage[]) || [];
    const currentStageInfo = stages.find((s) => s.id === lead.currentStage);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/leads/${lead.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    notes: notes || null,
                    value: value ? parseFloat(value) : null,
                }),
            });

            if (res.ok) {
                toast.success("Lead updated");
                router.refresh();
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to update");
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.error("An error occurred");
        } finally {
            setSaving(false);
        }
    };

    const handleStageChange = async (newStageId: string) => {
        if (newStageId === lead.currentStage) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/leads/${lead.id}/stage`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stageId: newStageId }),
            });

            if (res.ok) {
                setLead({ ...lead, currentStage: newStageId });
                setSelectedStage(newStageId);
                toast.success("Stage updated");
                router.refresh();
            } else {
                toast.error("Failed to update stage");
            }
        } catch (error) {
            console.error("Stage update error:", error);
            toast.error("An error occurred");
        } finally {
            setSaving(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/leads">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{lead.customerName}</h2>
                        <p className="text-muted-foreground">{lead.campaign?.name || lead.campaignName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge
                        style={{
                            backgroundColor: currentStageInfo?.color || "#6b7280",
                            color: "#fff",
                        }}
                    >
                        {currentStageInfo?.name || lead.currentStage}
                    </Badge>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Save
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                    {/* Contact Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Phone</Label>
                                    <p className="flex items-center gap-2 text-lg font-medium">
                                        <Phone className="h-4 w-4" />
                                        {lead.phone}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Email</Label>
                                    <p className="flex items-center gap-2 text-lg font-medium">
                                        <Mail className="h-4 w-4" />
                                        {lead.email || "-"}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">CS Number</Label>
                                    <p className="text-lg font-medium">{lead.csNumber || "-"}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Lead Date</Label>
                                    <p className="text-lg font-medium">
                                        {format(new Date(lead.leadDate), "dd MMM yyyy")}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes & Value */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Lead Details</CardTitle>
                            <CardDescription>Add notes and track revenue</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="value">Revenue / Value (IDR)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="value"
                                        type="number"
                                        placeholder="0"
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Add notes about this lead..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Stage Selector */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pipeline Stage</CardTitle>
                            <CardDescription>{lead.pipeline?.name || "Default Pipeline"}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Select value={selectedStage} onValueChange={handleStageChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select stage" />
                                </SelectTrigger>
                                <SelectContent>
                                    {stages.map((stage) => (
                                        <SelectItem key={stage.id} value={stage.id}>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: stage.color }}
                                                />
                                                {stage.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* Stage History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Stage History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {lead.stageHistory.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No stage changes yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {lead.stageHistory.map((item) => {
                                        const fromStage = stages.find((s) => s.id === item.fromStage);
                                        const toStage = stages.find((s) => s.id === item.toStage);
                                        return (
                                            <div key={item.id} className="text-sm border-l-2 border-muted pl-3">
                                                <p className="font-medium">
                                                    {fromStage?.name || item.fromStage} →{" "}
                                                    {toStage?.name || item.toStage}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {format(new Date(item.movedAt), "dd MMM yyyy HH:mm")}
                                                </p>

                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Audit Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Audit Trail</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <div>
                                <Label className="text-muted-foreground">Created</Label>
                                <p>{format(new Date(lead.createdAt), "dd MMM yyyy HH:mm")}</p>
                                {lead.createdBy?.name && (
                                    <p className="text-muted-foreground">by {lead.createdBy.name}</p>
                                )}
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Last Updated</Label>
                                <p>{format(new Date(lead.updatedAt), "dd MMM yyyy HH:mm")}</p>
                                {lead.updatedBy?.name && (
                                    <p className="text-muted-foreground">by {lead.updatedBy.name}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
