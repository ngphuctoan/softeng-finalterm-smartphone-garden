import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../utils/db.js";
import { v4 as uuidv4 } from "uuid";
import roles from "../utils/roles.js";
import { NextFunction, Request, Response } from "express";

const loginSchema = z.object({
    email: z.string().min(1),
    password: z.string().min(1)
});

const registerSchema = z.object({
    name: z.string().regex(/^[\p{L}\p{N} -]+$/u, "Invalid name.").min(1),
    email: z.string().email("Invalid email.").min(1),
    password: z.string().min(8, "Password too short.")
});

export async function login(req: Request, res: Response) {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            password: true,
            role: {
                select: { name: true }
            }
        }
    });

    if (!user || !await bcrypt.compare(password, user.password)) {
        res.status(404).send("Incorrect email or password.");
        return;
    }

    const token = jwt.sign(
        {
            jti: uuidv4(),
            userId: user.id,
            permissions: roles[user.role.name]
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "1w" }
    );

    res.cookie(
        "authToken",
        token,
        {
            httpOnly: true,
            secure: true,
            sameSite: true,
            maxAge: 604800000
        }
    );
    
    res.send("Logged in successfully!");
}

export async function register(req: Request, res: Response, next: NextFunction) {
    const { name, email, password } = registerSchema.parse(req.body);

    if (await prisma.user.findUnique({ where: { email } })) {
        res.status(409).send("Email was already taken.");
        return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const defaultRole = { name: "customer" };

    await prisma.user.create({
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

    req.body = { email, password };
    next();
}

export async function logout(req: Request, res: Response) {
    if (!req.auth) {
        res.status(401).send("Not logged in.");
        return;
    }

    await prisma.revokedToken.create({
        data: {
            jti: req.auth.jti as string,
            expiresAt: new Date((req.auth.exp ?? 604800) * 1000)
        }
    });

    res.clearCookie("authToken");
    res.send("Logged out successfully!");
}