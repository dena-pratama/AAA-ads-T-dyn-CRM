"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Settings, Save } from "lucide-react";
import { toast } from "sonner";

interface MetricConfig {
    id: string;
    label: string;
    format: string;
    visible: boolean;
    order: number;
}

interface AnalyticsSettingsProps {
    metrics: MetricConfig[];
    onSave: (metrics: MetricConfig[]) => void;
}

export function AnalyticsSettings({ metrics, onSave }: AnalyticsSettingsProps) {
    const [open, setOpen] = useState(false);
    const [localMetrics, setLocalMetrics] = useState<MetricConfig[]>(metrics);

    // Sync when dialog opens
    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            setLocalMetrics(metrics);
        }
        setOpen(isOpen);
    };

    const toggleMetric = (id: string, checked: boolean) => {
        setLocalMetrics(prev =>
            prev.map(m => m.id === id ? { ...m, visible: checked } : m)
        );
    };

    const handleSave = () => {
        onSave(localMetrics);
        setOpen(false);
        toast.success("Dashboard settings updated");
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Dashboard Settings</DialogTitle>
                    <DialogDescription>
                        Configure which metrics to display on your dashboard.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <h4 className="mb-4 text-sm font-medium leading-none">Visible Metrics</h4>
                    <div className="space-y-4">
                        {localMetrics.sort((a, b) => a.order - b.order).map((metric) => (
                            <div key={metric.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`metric-${metric.id}`}
                                    checked={metric.visible}
                                    onCheckedChange={(checked) => toggleMetric(metric.id, !!checked)}
                                />
                                <Label
                                    htmlFor={`metric-${metric.id}`}
                                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    {metric.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
