import Image from "next/image";
import { logout } from "@/app/actions/auth";
import { ModeToggle } from "@/components/mode-toggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface HeaderProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role: string;
        clientName?: string | null;
    };
}

export function Header({ user }: HeaderProps) {
    return (
        <header className="border-b border-border bg-background/50 backdrop-blur-xl sticky top-0 z-50 transition-colors duration-300">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <a href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-white/10">
                                <Image
                                    src="/logo.jpg"
                                    alt="Asoy Analytics Ads Logo"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-foreground">
                                    Asoy Analytics Ads
                                </h1>
                                <p className="text-xs text-muted-foreground">
                                    {user.role === "SUPER_ADMIN"
                                        ? "Super Admin"
                                        : `${user.role.replace("_", " ")} ${user.clientName ? `— ${user.clientName}` : ""}`}
                                </p>
                            </div>
                        </a>
                    </a>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    <a href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</a>
                    <a href="/clients" className="text-sm font-medium hover:text-primary transition-colors">Clients</a>
                    {user.role === "SUPER_ADMIN" && (
                        <a href="/users" className="text-sm font-medium hover:text-primary transition-colors">Users</a>
                    )}
                    <a href="/pipelines" className="text-sm font-medium hover:text-primary transition-colors">Pipelines</a>
                </nav>

                <div className="flex items-center gap-4">
                    <ModeToggle />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                                    <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                                    <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                                        {user.name?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {user.role === "SUPER_ADMIN" && (
                                <DropdownMenuItem asChild className="cursor-pointer">
                                    <a href="/users">Manage Users</a>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem asChild className="cursor-pointer">
                                <a href="/settings">Profile Settings</a>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer p-0">
                                <form action={logout} className="w-full">
                                    <button type="submit" className="w-full text-left px-2 py-1.5 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300">
                                        Log out
                                    </button>
                                </form>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
        </header >
    );
}
