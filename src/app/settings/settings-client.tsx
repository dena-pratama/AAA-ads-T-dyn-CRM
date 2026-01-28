"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, Trash2 } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email(),
    password: z.string().optional(),
    role: z.string(),
    clientName: z.string().optional(),
    image: z.string().optional(),
})

interface SettingsClientProps {
    user: {
        name?: string | null;
        email?: string | null;
        role: string;
        clientName?: string | null;
        image?: string | null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
    };
}

export function SettingsClient({ user }: SettingsClientProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [alertOpen, setAlertOpen] = useState(false)
    const [pendingValues, setPendingValues] = useState<z.infer<typeof profileSchema> | null>(null)
    const [previewImage, setPreviewImage] = useState<string | null>(user.image || null)

    // File input ref
    const fileInputRef = useRef<HTMLInputElement>(null)

    const router = useRouter()

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user.name || "",
            email: user.email || "",
            role: user.role || "",
            clientName: user.clientName || "",
            password: "",
            image: user.image || "",
        },
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation: Max size 1MB
        if (file.size > 1 * 1024 * 1024) {
            alert("File too large. Maximum size is 1MB.");
            return;
        }

        // Validation: Image only
        if (!file.type.startsWith("image/")) {
            alert("Please upload a valid image file.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setPreviewImage(base64String);
            form.setValue("image", base64String); // Update form state
            form.trigger("image"); // Trigger validation if any
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setPreviewImage(null);
        form.setValue("image", "");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Step 1: Triggered by form submit
    function onPreSubmit(values: z.infer<typeof profileSchema>) {
        setPendingValues(values)
        setAlertOpen(true)
    }

    // Step 2: Triggered by Alert Confirmation
    async function executeSave() {
        if (!pendingValues) return;

        setIsLoading(true)
        try {
            const payload: Record<string, unknown> = {
                name: pendingValues.name,
                image: pendingValues.image || null // Send null if empty string
            };

            if (pendingValues.password && pendingValues.password.length >= 6) {
                payload.password = pendingValues.password;
            }

            const response = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to update profile");
            }

            // Success handling
            setAlertOpen(false)
            router.refresh() // Refresh server components (Header/Dashboard)
            router.push("/dashboard")

        } catch (error: unknown) {
            console.error(error)
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <form onSubmit={form.handleSubmit(onPreSubmit)} className="space-y-6">

                {/* Profile Information Card */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl">Profile Information</CardTitle>
                        <CardDescription>
                            Update your personal identification details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Avatar Section */}
                        <div className="flex items-center gap-6 pb-2">
                            <Avatar className="h-24 w-24 border-2 border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer hover:opacity-90 transition-opacity" onClick={() => fileInputRef.current?.click()}>
                                <AvatarImage src={previewImage || ""} alt="Preview" className="object-cover" />
                                <AvatarFallback className="text-3xl bg-slate-100 dark:bg-slate-800">
                                    {user.name?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-3 flex-1">
                                <div>
                                    <Label className="text-base font-semibold">Profile Picture</Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Upload a new avatar. Max size 1MB.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="h-4 w-4" />
                                        Upload Image
                                    </Button>
                                    {previewImage && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                            onClick={handleRemoveImage}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Remove
                                        </Button>
                                    )}
                                </div>
                                {/* Hidden File Input */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/jpg, image/webp"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" {...form.register("name")} placeholder="Your Name" />
                                {form.formState.errors.name && (
                                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" {...form.register("email")} disabled className="bg-slate-100 dark:bg-slate-800 opacity-70" />
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Read Only</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-2">
                                <Label>Role Access</Label>
                                <div className="flex items-center h-10">
                                    <Badge variant="outline" className="text-sm font-normal py-1 px-3">
                                        {user.role}
                                    </Badge>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Organization</Label>
                                <div className="flex items-center h-10 px-3 rounded-md border bg-slate-50 dark:bg-slate-900/50 text-sm text-muted-foreground w-full">
                                    {user.clientName || "-"}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Card */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl">Security</CardTitle>
                        <CardDescription>
                            Manage your account password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-w-md">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                {...form.register("password")}
                                placeholder="• • • • • •"
                            />
                            <p className="text-xs text-muted-foreground">Leave blank to keep current password. Minimum 6 characters.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Preferences Card */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl">Preferences</CardTitle>
                        <CardDescription>
                            Customize the application appearance.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-2">
                            <div className="space-y-1">
                                <Label className="text-base">Dark Mode</Label>
                                <p className="text-sm text-muted-foreground">Toggle between light and dark themes.</p>
                            </div>
                            <ModeToggle />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-4 pb-10">
                    <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px] shadow-lg shadow-blue-500/20">
                        Save Changes
                    </Button>
                </div>
            </form>

            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Save Changes?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to update your profile information?
                            {pendingValues?.password && (
                                <span className="block mt-2 font-medium text-amber-600 dark:text-amber-400">
                                    Note: You are also changing your password. You will need to use the new password next time you log in.
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                executeSave();
                            }}
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Save
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
