import Image from "next/image";
import { LoginForm } from "@/app/login/login-form";
import { ModeToggle } from "@/components/mode-toggle";

export const metadata = {
    title: "Login - Asoy Analytics Ads",
};

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative transition-colors duration-300">
            {/* Theme Toggle */}
            <div className="absolute top-4 right-4">
                <ModeToggle />
            </div>

            {/* Main Container */}
            <div className="w-full max-w-md space-y-8 z-10">

                {/* Logo Section */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 overflow-hidden relative mb-2">
                        <Image
                            src="/logo.jpg"
                            alt="Asoy Analytics Ads Logo"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Asoy Analytics Ads
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Kalau login tanda nya kamu mau kerja
                        </p>
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-2xl shadow-slate-200/50 dark:shadow-black/20">
                    <LoginForm />
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-slate-400 dark:text-slate-600">
                    &copy; 2026 Asoy Analytics Ads. All rights reserved.
                </div>
            </div>

            {/* Background Decorations */}
            <div className="fixed inset-0 min-h-screen pointer-events-none overflow-hidden -z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-blue-100/50 dark:bg-blue-900/10 blur-3xl mix-blend-multiply dark:mix-blend-normal transform rotate-12 animate-blob" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-purple-100/50 dark:bg-purple-900/10 blur-3xl mix-blend-multiply dark:mix-blend-normal transform -rotate-12 animate-blob animation-delay-2000" />
            </div>
        </div>
    );
}
