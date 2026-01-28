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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { User } from "@/app/users/columns"

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().optional(),
    role: z.enum(["SUPER_ADMIN", "CLIENT_ADMIN", "CS"]),
    clientId: z.string().optional(),
})

interface UserDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    userToEdit?: User | null;
}

// Simple client type for the dropdown
type ClientOption = { id: string; name: string };

export function UserDialog({ open, setOpen, userToEdit }: UserDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [clients, setClients] = useState<ClientOption[]>([])
    const router = useRouter()

    // Fetch clients for dropdown
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await fetch("/api/clients");
                if (res.ok) {
                    const data = await res.json();
                    setClients(data);
                }
            } catch (e) {
                console.error("Failed to fetch clients", e);
            }
        };
        if (open) fetchClients();
    }, [open]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: "CS", // Default role
            clientId: undefined,
        },
    })

    // Reset/Populate form when opening/editing
    useEffect(() => {
        if (userToEdit) {
            form.reset({
                name: userToEdit.name || "",
                email: userToEdit.email,
                role: userToEdit.role,
                clientId: userToEdit.clientId || undefined,
                password: "", // Don't populate password
            });
        } else {
            form.reset({
                name: "",
                email: "",
                password: "",
                role: "CS",
                clientId: undefined,
            });
        }
    }, [userToEdit, form, open]);

    const selectedRole = form.watch("role");

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Custom validation: Password is required for new users
        if (!userToEdit && (!values.password || values.password.length < 6)) {
            form.setError("password", { message: "Password is required (min 6 chars) for new users" });
            return;
        }

        setIsLoading(true)
        try {
            const url = userToEdit ? `/api/users/${userToEdit.id}` : "/api/users";
            const method = userToEdit ? "PUT" : "POST";

            // Clean up empty strings to undefined
            const payload = {
                ...values,
                password: values.password || undefined,
                clientId: values.clientId || undefined,
            }

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const errorText = await response.text();
                // Try to parse validation array if possible
                try {
                    const errors = JSON.parse(errorText);
                    if (Array.isArray(errors)) {
                        alert(`Validation Error: ${errors.map(e => e.message).join(", ")}`);
                        return;
                    }
                } catch (e) { }

                throw new Error(errorText || "Failed to save user");
            }

            setOpen(false)
            router.refresh()
        } catch (error: any) {
            console.error(error)
            alert(`Error: ${error.message}`);
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{userToEdit ? "Edit User" : "Add New User"}</DialogTitle>
                    <DialogDescription>
                        {userToEdit ? "Update user details." : "Create a new user account."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
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
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="name@example.com" type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{userToEdit ? "New Password (Optional)" : "Password"}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={userToEdit ? "Leave blank to keep current" : "Min. 6 characters"}
                                            type="password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                            <SelectItem value="CLIENT_ADMIN">Client Admin</SelectItem>
                                            <SelectItem value="CS">Customer Service (CS)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Super Admin has full access. Client Admin manages specific client. CS can only input leads.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {selectedRole !== "SUPER_ADMIN" && (
                            <FormField
                                control={form.control}
                                name="clientId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assign to Client</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a client" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {clients.map((client) => (
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

                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {userToEdit ? "Save Changes" : "Create User"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
