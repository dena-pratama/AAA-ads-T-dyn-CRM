
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Connecting to database...");
        const clients = await prisma.client.findMany();
        console.log("Clients found:", clients.length);
        console.log("Client List:", JSON.stringify(clients, null, 2));

        const user = await prisma.user.findUnique({
            where: { email: "admin@aaa-ads.com" }
        });
        console.log("Admin User Role:", user?.role);

        // Simulation of API logic
        const sessionRole = user?.role;
        const sessionClientId = user?.clientId;

        const where = sessionRole === "SUPER_ADMIN" 
            ? {} 
            : { id: sessionClientId || "non-existent" };
        
        console.log("Simulated Query Where:", where);

        const clientsViaLogic = await prisma.client.findMany({
            where,
            orderBy: { createdAt: "desc" }
        });

        console.log("Simulated API Result Clients:", clientsViaLogic.length);
    } catch (e) {
        console.error("Error fetching clients:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
