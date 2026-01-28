import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.clientId = user.clientId;
                token.clientName = user.clientName;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.clientId = token.clientId as string | null;
                session.user.clientName = token.clientName as string | undefined;
            }
            return session;
        },
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
