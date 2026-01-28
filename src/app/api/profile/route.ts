import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const profileUpdateSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
});

export async function GET(req: Request) {
    const session = await auth();

    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                client: { select: { name: true } }
            }
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        const { password: _, ...safeUser } = user;
        return NextResponse.json({
            ...safeUser,
            clientName: user.client?.name || (user.role === "SUPER_ADMIN" ? "Global Admin" : "-")
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await auth();

    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const json = await req.json();
        const body = profileUpdateSchema.parse(json);

        const updateData: any = {};

        if (body.name) updateData.name = body.name;

        if (body.password) {
            updateData.password = await bcrypt.hash(body.password, 10);
        }

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
        });

        const { password: _, ...safeUser } = user;
        return NextResponse.json(safeUser);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 422 });
        }
        console.error("Error updating profile:", error);
        return new NextResponse(`Internal Server Error: ${error instanceof Error ? error.message : "Unknown error"}`, { status: 500 });
    }
}
