import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "@utils/db";
import roles from "@utils/roles";
import { UserModel } from "@models";
import { v4 as uuidv4 } from "uuid";
import { handleError } from "@utils/errors";
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
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await UserModel.getByEmail(email);
        const passwordHash = await UserModel.getPasswordHash(user.id);

        if (!user || !await bcrypt.compare(password, passwordHash)) {
            res.status(404).send("Incorrect email or password.");
            return;
        }

        const token = jwt.sign(
            {
                jti: uuidv4(),
                userId: user.id,
                permissions: roles[user.roleName]
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
    } catch (error) {
        handleError(error, res);
    }
}

export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, email, password } = registerSchema.parse(req.body);

        if (await UserModel.getByEmail(email)) {
            res.status(409).send("Email was already taken.");
            return;
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const defaultRole = "customer";

        await UserModel.add({
            name,
            email,
            password: passwordHash,
            roleName: defaultRole
        });

        req.body = { email, password };
        next();
    } catch (error) {
        handleError(error, res);
    }
}

export async function logout(req: Request, res: Response) {
    if (!req.auth) {
        res.send("Already logged out!");
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