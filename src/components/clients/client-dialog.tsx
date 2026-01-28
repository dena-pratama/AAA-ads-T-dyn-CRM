"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { Client } from "@/app/clients/columns"
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    currency: z.string().min(1, "Business Model is required"),
    description: z.string().optional(),
    isActive: z.boolean(),
})

interface ClientDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    clientToEdit?: Client | null;
}

export function ClientDialog({ open, setOpen, clientToEdit }: ClientDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            currency: "",
            description: "",
            isActive: true,
        },
    })

    // Reset/Populate form
    useEffect(() => {
        if (clientToEdit) {
            form.reset({
                name: clientToEdit.name,
                currency: clientToEdit.currency,
                description: clientToEdit.description || "",
                isActive: clientToEdit.isActive,
            });
        } else {
            form.reset({
                name: "",
                currency: "",
                description: "",
                isActive: true,
            });
        }
    }, [clientToEdit, form, open]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const url = clientToEdit ? `/api/clients/${clientToEdit.id}` : "/api/clients";
            const method = clientToEdit ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to save client");
            }

            setOpen(false)
            router.refresh()
        } catch (error: unknown) {
            console.error(error)
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{clientToEdit ? "Edit Client" : "Add New Client"}</DialogTitle>
                    <DialogDescription>
                        {clientToEdit ? "Update client details." : "Create a new tenant workspace."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Client Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Acme Inc." {...field} />
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
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Retail Division" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Business Model</FormLabel>
                                    <FormControl>
                                        <Input placeholder="F&B, Clothing .etc" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {clientToEdit && (
                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Active Status
                                            </FormLabel>
                                            <FormDescription>
                                                Inactive clients cannot be accessed by their users.
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        )}

                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {clientToEdit ? "Save Changes" : "Create Client"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
