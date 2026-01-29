
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        let targetClientId = session.user.clientId;

        // If Super Admin, allow viewing any client's history if clientId query param provided
        if (session.user.role === "SUPER_ADMIN") {
            const { searchParams } = new URL(req.url);
            const queryClientId = searchParams.get('clientId');
            if (queryClientId) {
                targetClientId = queryClientId;
            } else if (!targetClientId) {
                // Fallback to searching all or specifically requiring a client context
                // For now, let's fetch all if no client specific
                // But wait, ImportHistory has clientId index.
                // Let's just default to all for superadmin if no clientId
            }
        }

        const whereClause = targetClientId ? { clientId: targetClientId } : {};

        const history = await prisma.importHistory.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'desc'
            },
            take: 50, // Limit to last 50 imports
            include: {
                // Optionally include invoker name if linked, currently importedById is just string
                // If we want user name: 
                // importedById isn't a relation in schema yet? 
                // Checking schema: importedById String? (no relation defined)
                // So we just return the ID
            }
        })

        return NextResponse.json(history)

    } catch (error) {
        console.error("Fetch Import History Error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
