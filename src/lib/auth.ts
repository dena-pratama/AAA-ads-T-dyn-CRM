import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma) as any,
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user, trigger }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.clientId = user.clientId;
                token.clientName = user.clientName;
            }

            // Fetch allowedBrandIds (on every request for now, optimize later with cache)
            if (token.id) {
                const memberships = await prisma.brandMembership.findMany({
                    where: { userId: token.id as string },
                    select: { brandId: true },
                });
                token.allowedBrandIds = memberships.map(m => m.brandId);
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.clientId = token.clientId as string | null;
                session.user.clientName = token.clientName as string | undefined;
                session.user.allowedBrandIds = token.allowedBrandIds as string[] | undefined;
            }
            return session;
        },
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const email = credentials.email as string;
                const password = credentials.password as string;

                const user = await prisma.user.findUnique({
                    where: { email },
                    include: { client: true },
                });

                // Check if user exists and has a password (provider users might not)
                if (!user || !user.isActive || !user.password) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(password, user.password);

                if (!isPasswordValid) {
                    return null;
                }

                // Update last login
                await prisma.user.update({
                    where: { id: user.id },
                    data: { lastLoginAt: new Date() },
                });

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    clientId: user.clientId,
                    clientName: user.client?.name,
                    image: user.image,
                };
            },
        }),
    ],
});
