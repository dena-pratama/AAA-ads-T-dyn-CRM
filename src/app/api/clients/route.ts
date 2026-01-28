import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const clientSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    currency: z.string().default("IDR"),
    description: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "SUPER_ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const json = await req.json();
        const body = clientSchema.parse(json);

        // Auto-generate slug from name
        let slug = body.name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");

        // Ensure slug is not empty
        if (!slug) {
            slug = `client-${Date.now()}`;
        }

        // Check for uniqueness
        const existingClient = await prisma.client.findUnique({
            where: { slug },
        });

        if (existingClient) {
            // Simple collision resolution for MVP
            slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }

        const client = await prisma.client.create({
            data: {
                name: body.name,
                currency: body.currency,
                description: body.description,
                slug,
            },
        });

        return NextResponse.json(client);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 422 });
        }
        console.error("Error creating client:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "SUPER_ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const clients = await prisma.client.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: {
                        users: true,
                        campaigns: true,
                        pipelines: true
                    }
                }
            }
        });

        return NextResponse.json(clients);
    } catch (error) {
        console.error("Error fetching clients:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
