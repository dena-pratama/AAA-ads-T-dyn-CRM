import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isAuthPage = nextUrl.pathname.startsWith("/login") ||
                nextUrl.pathname.startsWith("/register");
            const isPublicPage = nextUrl.pathname === "/";
            const isApiRoute = nextUrl.pathname.startsWith("/api");

            // Allow API routes
            if (isApiRoute) {
                return true;
            }

            // Redirect authenticated users away from auth pages
            if (isLoggedIn && isAuthPage) {
                return Response.redirect(new URL("/dashboard", nextUrl));
            }

            // Allow public pages and auth pages
            if (isPublicPage || isAuthPage) {
                return true;
            }

            // Allow access if logged in, otherwise return false (which redirects to login)
            return isLoggedIn;
        },
    },
    providers: [], // Providers configured in auth.ts
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
} satisfies NextAuthConfig;
