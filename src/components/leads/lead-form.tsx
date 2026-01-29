"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
    customerName: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().min(8, "Phone number is too short"),
    email: z.string().email().optional().or(z.literal("")),
    pipelineId: z.string().min(1, "Please select a pipeline"),
    stageId: z.string().min(1, "Please select a stage"),
    source: z.string().optional(),
    csNumber: z.string().optional(),
})

interface LeadToEdit {
    id: string;
    customerName: string;
    phone: string;
    email?: string;
    pipelineId: string;
    stageId: string;
    source?: string;
    csNumber?: string;
}

interface LeadFormProps {
    pipelines: { id: string, name: string, stages: { id: string, name: string }[] }[];
    onSuccess: () => void;
    leadToEdit?: LeadToEdit;
}

export function LeadForm({ pipelines, onSuccess, leadToEdit }: LeadFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const isEditing = !!leadToEdit

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            customerName: leadToEdit?.customerName || "",
            phone: leadToEdit?.phone || "",
            email: leadToEdit?.email || "",
            pipelineId: leadToEdit?.pipelineId || "",
            stageId: leadToEdit?.stageId || "",
            source: leadToEdit?.source || "",
            csNumber: leadToEdit?.csNumber || "",
        },
    })

    // Reset form when leadToEdit changes (for editing different leads)
    useEffect(() => {
        if (leadToEdit) {
            form.reset({
                customerName: leadToEdit.customerName,
                phone: leadToEdit.phone,
                email: leadToEdit.email || "",
                pipelineId: leadToEdit.pipelineId,
                stageId: leadToEdit.stageId,
                source: leadToEdit.source || "",
                csNumber: leadToEdit.csNumber || "",
            })
        }
    }, [leadToEdit, form])

    // Determine active stages based on selected pipeline
    const selectedPipelineId = form.watch("pipelineId")
    const activeStages = pipelines.find(p => p.id === selectedPipelineId)?.stages || []

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const payload = { ...values }

            const url = isEditing ? `/api/leads/${leadToEdit.id}` : "/api/leads"
            const method = isEditing ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const errorText = await res.text()
                throw new Error(errorText || (isEditing ? "Failed to update lead" : "Failed to create lead"))
            }

            if (!isEditing) form.reset()
            onSuccess()
        } catch (error) {
            console.error(error)
            alert(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Customer Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone (WhatsApp)</FormLabel>
                                <FormControl>
                                    <Input placeholder="628123..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="john@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="pipelineId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Pipeline</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Pipeline" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {pipelines.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="stageId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Stage</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedPipelineId}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Stage" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {
                                            activeStages.map((s) => (
                                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Source</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Source" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Meta">Meta</SelectItem>
                                    <SelectItem value="GAds">GAds</SelectItem>
                                    <SelectItem value="LinkedAds">LinkedAds</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="csNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>No CS</FormLabel>
                            <FormControl>
                                <Input placeholder="CS1, CS2, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Lead
                </Button>
            </form>
        </Form>
    )
}
