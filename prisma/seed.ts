import bcrypt from "bcrypt";
import prisma from "../src/utils/db.js";
import project from "../package.json" with { type: "json" };

const FALLBACK_USER = {
    NAME: "fallback",
    EMAIL: `fallback@${project.name}`,
    PASSWORD: "nhom11",
    ROLE: { name: "administrator" }
} as const;

async function main() {
    if (
        await prisma.user.findUnique({
            where: { email: FALLBACK_USER.EMAIL }
        })
    ) {
        process.exit(0);
    }

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

main().catch((error: Error) => {
    console.error(error);
    process.exit(1);
});