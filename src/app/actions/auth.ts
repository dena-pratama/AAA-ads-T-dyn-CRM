"use server";

import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function login(
    prevState: { error?: string } | undefined,
    formData: FormData
): Promise<{ error?: string } | undefined> {
    try {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const callbackUrl = formData.get("callbackUrl") as string || "/dashboard";

        await signIn("credentials", {
            email,
            password,
            redirectTo: callbackUrl,
        });

        return undefined;
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Email atau password salah" };
                default:
                    return { error: "Terjadi kesalahan. Silakan coba lagi." };
            }
        }
        throw error;
    }
}

export async function logout() {
    await signOut({ redirectTo: "/login" });
}
