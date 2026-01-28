
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const email = "dena@email.com";
    const password = "123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: "SUPER_ADMIN",
            isActive: true,
            name: "Dena Pratama",
            image: "", // Optional: Add a default avatar if desired
        },
        create: {
            email,
            password: hashedPassword,
            name: "Dena Pratama",
            role: "SUPER_ADMIN",
            isActive: true,
        },
    });

    console.log(`Created/Updated Super Admin: ${user.email}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
