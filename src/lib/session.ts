import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";

// Type for extended user session
export type UserSession = {
    id: string;
    email: string;
    name: string;
    role: string;
    clientId: string | null;
    clientName?: string;
};

// Get current session on server
export async function getCurrentUser(): Promise<UserSession | null> {
    const session = await auth();
    if (!session?.user) return null;
    return session.user as UserSession;
}

// Check if user has required role
export function hasRole(userRole: string, requiredRoles: string[]): boolean {
    return requiredRoles.includes(userRole);
}

// Check if user is Super Admin
export function isSuperAdmin(role: string): boolean {
    return role === "SUPER_ADMIN";
}

// Check if user is Client Admin
export function isClientAdmin(role: string): boolean {
    return role === "CLIENT_ADMIN";
}

// Check if user is CS
export function isCS(role: string): boolean {
    return role === "CS";
}

// Check if user can access client data
export function canAccessClient(
    userRole: string,
    userClientId: string | null,
    targetClientId: string
): boolean {
    if (userRole === "SUPER_ADMIN") return true;
    return userClientId === targetClientId;
}
