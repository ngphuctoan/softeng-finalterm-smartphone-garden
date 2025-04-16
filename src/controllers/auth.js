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

    res.cookie("auth_token", token, { httpOnly: true, secure: true });
    res.send("Logged in successfully!");
}

export async function register(req, res, next) {
    const { name, email, password } = req.bodyData;

    if (await prisma.user.findUnique({ where: { email } })) {
        return res.status(409).send("Email was already taken.");
    }

    // Performs password validation here...

    const passwordHash = await bcrypt.hash(password, 10);
    const defaultRole = { name: "customer" };

    const user = await prisma.user.create({
        data: {
            name, email,
            password: passwordHash,
            role: {
                connectOrCreate: {
                    where: defaultRole,
                    create: defaultRole
                }
            }
        }
    });

    req.body = { email: user.email, password: user.password };
    next();
}

export async function logout(req, res) {
    await prisma.authTokenLogout.create({
        data: {
            jti: req.decoded.jti,
            expiresAt: new Date(req.decoded.exp * 1000)
        }
    });

    res.removeHeader("Authorization");
    res.send("Logged out successfully!");
}