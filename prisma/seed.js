import bcrypt from "bcrypt";
import project from "../package.json" with { type: "json" };
import { PrismaClient } from "../src/generated/prisma/index.js";

const ROLES = ["Administrator", "Manager", "Customer"];

const FALLBACK_EMAIL = `fallback@${project.name}`;
const FALLBACK_PASSWORD = "nhom11";

const prisma = new PrismaClient();

async function main() {
    for (const role of ROLES) {
        const data = { name: role };

        if (!await prisma.role.findUnique({ where: data })) {
            await prisma.role.create({ data });
        }
    }

    const passwordHash = await bcrypt.hash(FALLBACK_PASSWORD, 10);
    const fallbackRole = await prisma.role.findUnique({
        where: { name: "Administrator" }
    });

    await prisma.user.create({
        data: {
            name: "Fallback",
            email: FALLBACK_EMAIL,
            password: passwordHash,
            roleId: fallbackRole.id
        }
    });
}

main()
    .catch(error => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());