"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";

export function LoginForm() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
    const [state, formAction, isPending] = useActionState(login, undefined);

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />

            {state?.error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{state.error}</span>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                    Email
                </Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nama@email.com"
                    required
                    autoComplete="email"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                    Password
                </Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                />
            </div>

            <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses...
                    </>
                ) : (
                    "Masuk"
                )}
            </Button>

            <div className="text-center">
                <p className="text-slate-400 text-sm">
                    Demo credentials:
                </p>
                <p className="text-slate-500 text-xs mt-1">
                    admin@aaa-ads.com / Admin@123
                </p>
            </div>
        </form>
    );
}
