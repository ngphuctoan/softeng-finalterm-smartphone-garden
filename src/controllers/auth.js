import bcrypt from "bcrypt";
import { generateToken } from "../middlewares/jwt.js";
import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

export async function login(req, res) {
    const { email, password } = req.bodyData;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(404).send("Incorrect email or password.");
    }

    const token = generateToken(user);

    res.setHeader("Authorization", `Bearer ${token}`);
    res.send("Logged in successfully!");
}

export async function register(req, res, next) {
    const { name, email, password } = req.bodyData;

    if (await prisma.user.findUnique({ where: { email } })) {
        return res.status(409).send("Email was already taken.");
    }

    // Performs password validation here...

    const passwordHash = await bcrypt.hash(password, 10);
    const defaultRole = await prisma.role.findUnique({
        where: { name: "Customer" }
    });

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: passwordHash,
            roleId: defaultRole.id
        }
    });

    req.body = { email: user.email, password: user.password };
    next();
}