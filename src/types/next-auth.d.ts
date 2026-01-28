import "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        email: string;
        name: string;
        role: string;
        clientId: string | null;
        clientName?: string;
    }

    interface Session {
        user: User;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        clientId: string | null;
        clientName?: string;
    }
}
