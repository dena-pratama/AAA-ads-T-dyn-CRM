import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const isAuthPage = nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register");
    const isPublicPage = nextUrl.pathname === "/";
    const isApiRoute = nextUrl.pathname.startsWith("/api");

    // Allow API routes
    if (isApiRoute) {
        return NextResponse.next();
    }

    // Redirect authenticated users away from auth pages
    if (isLoggedIn && isAuthPage) {
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    // Allow public pages and auth pages
    if (isPublicPage || isAuthPage) {
        return NextResponse.next();
    }

    // Redirect unauthenticated users to login
    if (!isLoggedIn) {
        const callbackUrl = encodeURIComponent(nextUrl.pathname);
        return NextResponse.redirect(
            new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
        );
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
