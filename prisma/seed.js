import bcrypt from "bcrypt";
import project from "../package.json" with { type: "json" };
import { PrismaClient } from "../src/generated/prisma/index.js";

const FALLBACK_USER = {
    NAME: "fallback",
    EMAIL: `fallback@${project.name}`,
    PASSWORD: "nhom11",
    ROLE: { name: "administrator" }
};

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash(FALLBACK_USER.PASSWORD, 10);

    await prisma.user.create({
        data: {
            name: FALLBACK_USER.NAME,
            email: FALLBACK_USER.EMAIL,
            password: passwordHash,
            role: {
                connectOrCreate: {
                    where: FALLBACK_USER.ROLE,
                    create: FALLBACK_USER.ROLE
                }
            }
        }
    });
}

main()
    .catch(error => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });