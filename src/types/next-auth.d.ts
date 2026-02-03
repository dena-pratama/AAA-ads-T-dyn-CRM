import "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        email: string;
        name?: string | null;
        role: string;
        clientId: string | null;
        clientName?: string;
        allowedBrandIds?: string[];
    }

    interface Session {
        user: User;
    }
}

declare module "next-auth/adapters" {
    interface AdapterUser {
        role: string;
        clientId: string | null;
        clientName?: string;
        allowedBrandIds?: string[];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        clientId: string | null;
        clientName?: string;
        allowedBrandIds?: string[];
    }
}
