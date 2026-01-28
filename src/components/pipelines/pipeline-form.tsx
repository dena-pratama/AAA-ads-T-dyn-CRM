
"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { pipelineSchema } from "@/lib/validators/pipeline"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowDown, ArrowUp, Plus, Trash2, GripVertical, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PipelineFormProps {
    initialData?: z.infer<typeof pipelineSchema> & { id: string }
    clients?: { id: string; name: string }[] // For SuperAdmin to choose client (optional)
    isSuperAdmin?: boolean
}

export function PipelineForm({ initialData, clients, isSuperAdmin }: PipelineFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    // Ensure we have at least one valid client if creating new as SuperAdmin
    const defaultClientId = initialData?.clientId || (clients && clients.length > 0 ? clients[0].id : "")

    const form = useForm<z.infer<typeof pipelineSchema>>({
        resolver: zodResolver(pipelineSchema),
        defaultValues: initialData || {
            name: "",
            description: "",
            isActive: true,
            isDefault: false,
            clientId: defaultClientId,
            stages: [
                { id: "stage_1", name: "New Lead", color: "#3B82F6", order: 0, isGoal: false },
                { id: "stage_2", name: "In Progress", color: "#EAB308", order: 1, isGoal: false },
                { id: "stage_3", name: "Closed Won", color: "#22C55E", order: 2, isGoal: true },
            ],
            customFields: []
        },
    })

    const { fields: stageFields, append: appendStage, remove: removeStage, move: moveStage } = useFieldArray({
        control: form.control,
        name: "stages",
    })

    const { fields: fieldFields, append: appendField, remove: removeField } = useFieldArray({
        control: form.control,
        name: "customFields",
    })

    const onSubmit = async (values: z.infer<typeof pipelineSchema>) => {
        setIsLoading(true)
        try {
            // Re-index stages to ensure correct order before saving
            const orderedStages = values.stages.map((stage, index) => ({
                ...stage,
                order: index
            }))

            const payload = { ...values, stages: orderedStages }

            const url = initialData ? `/api/pipelines/${initialData.id}` : "/api/pipelines"
            const method = initialData ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const text = await res.text()
                throw new Error(text || "Failed to save pipeline")
            }

            router.push("/pipelines")
            router.refresh()
        } catch (error: any) {
            console.error(error)
            alert(`Error: ${error.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">
                            {initialData ? "Edit Pipeline" : "Create Pipeline"}
                        </h2>
                        <p className="text-muted-foreground">
                            Configure your sales process stages and data fields.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initialData ? "Save Changes" : "Create Pipeline"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: General Settings */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>General Config</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pipeline Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Real Estate Sales" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Optional description" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {isSuperAdmin && clients && (
                                    <FormField
                                        control={form.control}
                                        name="clientId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Assign to Client</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!initialData}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a client" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {clients.map(client => (
                                                            <SelectItem key={client.id} value={client.id}>
                                                                {client.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <Separator />

                                <FormField
                                    control={form.control}
                                    name="isDefault"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Set as Default</FormLabel>
                                                <FormDescription>
                                                    Make this the primary pipeline for new leads.
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Active</FormLabel>
                                                <FormDescription>
                                                    Inactive pipelines are hidden from users.
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: Stages & Fields */}
                    <div className="md:col-span-2 space-y-6">
                        {/* STAGES CONFIG */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Pipeline Stages</CardTitle>
                                    <CardDescription>Define the steps of your sales process.</CardDescription>
                                </div>
                                <Button size="sm" variant="secondary" type="button" onClick={() => appendStage({
                                    id: `stage_${Date.now()}`,
                                    name: "New Stage",
                                    color: "#64748B",
                                    order: stageFields.length,
                                    isGoal: false
                                })}>
                                    <Plus className="h-4 w-4 mr-2" /> Add Stage
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {stageFields.map((field, index) => (
                                    <div key={field.id} className="flex items-center gap-3 p-3 border rounded-lg bg-card hover:bg-accent/10 transition-colors">
                                        <div className="flex flex-col gap-1">
                                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" disabled={index === 0} onClick={() => moveStage(index, index - 1)}>
                                                <ArrowUp className="h-4 w-4" />
                                            </Button>
                                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" disabled={index === stageFields.length - 1} onClick={() => moveStage(index, index + 1)}>
                                                <ArrowDown className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-12 gap-3 flex-1 items-center">
                                            {/* Badge for Order */}
                                            <div className="col-span-1 text-center font-mono text-sm text-muted-foreground">{index + 1}</div>

                                            <div className="col-span-5">
                                                <Input {...form.register(`stages.${index}.name`)} placeholder="Stage Name" />
                                            </div>

                                            <div className="col-span-2">
                                                <div className="flex items-center gap-2">
                                                    <Input type="color" {...form.register(`stages.${index}.color`)} className="w-8 h-8 p-0 border-0" />
                                                    <span className="text-xs text-muted-foreground">Color</span>
                                                </div>
                                            </div>

                                            <div className="col-span-4 flex items-center gap-4">
                                                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                                                    <input type="checkbox" {...form.register(`stages.${index}.isGoal`)} className="rounded border-gray-300" />
                                                    Is Goal?
                                                </label>
                                            </div>
                                        </div>

                                        <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => removeStage(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {stageFields.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                        No stages defined. Add a stage to start.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* CUSTOM FIELDS CONFIG */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Custom Fields</CardTitle>
                                    <CardDescription>Additional data fields for your leads.</CardDescription>
                                </div>
                                <Button size="sm" variant="secondary" type="button" onClick={() => appendField({
                                    id: `field_${Date.now()}`,
                                    name: "",
                                    type: "text",
                                    required: false
                                })}>
                                    <Plus className="h-4 w-4 mr-2" /> Add Field
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {fieldFields.map((field, index) => (
                                    <div key={field.id} className="p-4 border rounded-lg space-y-4 relative bg-card">
                                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 hover:text-red-700" onClick={() => removeField(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase text-muted-foreground">Field Label</Label>
                                                <Input {...form.register(`customFields.${index}.name`)} placeholder="e.g. Budget" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase text-muted-foreground">Type</Label>
                                                <Select
                                                    onValueChange={(val: any) => form.setValue(`customFields.${index}.type`, val)}
                                                    defaultValue={form.getValues(`customFields.${index}.type`)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="text">Text Input</SelectItem>
                                                        <SelectItem value="number">Number</SelectItem>
                                                        <SelectItem value="select">Dropdown</SelectItem>
                                                        <SelectItem value="date">Date Picker</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Show options input if type is select */}
                                        {form.watch(`customFields.${index}.type`) === "select" && (
                                            <div className="space-y-2 bg-muted/50 p-3 rounded-md">
                                                <Label className="text-xs uppercase text-muted-foreground">Dropdown Options</Label>
                                                <Input
                                                    placeholder="Option A, Option B, Option C (comma separated)"
                                                    onChange={(e) => {
                                                        const arr = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                                                        form.setValue(`customFields.${index}.options`, arr);
                                                    }}
                                                    defaultValue={form.getValues(`customFields.${index}.options`)?.join(", ") || ""}
                                                />
                                                <p className="text-xs text-muted-foreground">Separate options with commas.</p>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                                                <input type="checkbox" {...form.register(`customFields.${index}.required`)} className="rounded border-gray-300" />
                                                This field is required
                                            </label>
                                        </div>
                                    </div>
                                ))}
                                {fieldFields.length === 0 && (
                                    <div className="text-center py-6 text-muted-foreground text-sm">
                                        No custom fields. Setup default fields here.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </Form>
    )
}

// Helper for labels inside map
function Label({ className, children }: { className?: string, children: React.ReactNode }) {
    return <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>{children}</label>
}
