import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "@utils/db";
import roles from "@utils/roles";
import { v4 as uuidv4 } from "uuid";
import { ProfileModel, UserModel } from "@models";
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

export async function showLoginPage(req: Request, res: Response) {
    if (req.cookies.authToken) {
        res.redirect("/");
    } else {
        res.render("auth/login");
    }
}

export async function showRegisterPage(req: Request, res: Response) {
    res.render("auth/register");
}

export async function login(req: Request, res: Response, next: NextFunction) {
    const { email, password } = loginSchema.parse(req.body);

    const user = await UserModel.getByEmail(email);
    const passwordHash = await UserModel.getPasswordHash(user.id);

    if (!user || !await bcrypt.compare(password, passwordHash)) {
        res.status(400).send("Incorrect email or password.");
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
    
    res.redirect("/");
}

export async function register(req: Request, res: Response, next: NextFunction) {
    const { name, email, password } = registerSchema.parse(req.body);

    try {
        if (await UserModel.getByEmail(email)) {
            res.status(409).send("Email was already taken.");
            return;
        }
    } catch {}

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
}

export async function logout(req: Request, res: Response, next: NextFunction) {
    if (!req.cookies.authToken) {
        return next();
    }

    const decoded = jwt.decode(req.cookies.authToken);

    if (decoded && typeof decoded !== "string") {
        await prisma.revokedToken.create({
            data: {
                jti: decoded.jti as string,
                expiresAt: new Date((decoded.exp ?? 604800) * 1000)
            }
        });
    }

    res.clearCookie("authToken");
    next();
}