import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const userCreateSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["SUPER_ADMIN", "CLIENT_ADMIN", "CS"]),
    clientId: z.string().optional().nullable(),
});

export async function GET(request: Request) {
    const session = await auth();

    // Only SUPER_ADMIN can view all users
    if (!session || session.user.role !== "SUPER_ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                client: {
                    select: { id: true, name: true },
                },
            },
        });

        // Safe return (exclude password)
        const safeUsers = users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            clientId: user.clientId,
            clientName: user.client?.name || "-",
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            image: user.image,
        }));

        return NextResponse.json(safeUsers);
    } catch (error) {
        console.error("Error fetching users:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "SUPER_ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const json = await req.json();
        const body = userCreateSchema.parse(json);

        // Check for existing email
        const existingUser = await prisma.user.findUnique({
            where: { email: body.email },
        });

        if (existingUser) {
            return new NextResponse("Email already exists", { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(body.password, 10);

        const user = await prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                password: hashedPassword,
                role: body.role,
                clientId: body.role !== "SUPER_ADMIN" ? body.clientId : null, // Only assign client if not SUPER_ADMIN
            },
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...safeUser } = user;
        return NextResponse.json(safeUser);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 422 });
        }
        console.error("Error creating user:", error); // Stack trace will be printed
        return new NextResponse(`Internal Server Error: ${error instanceof Error ? error.message : "Unknown error"}`, { status: 500 });
    }
}
