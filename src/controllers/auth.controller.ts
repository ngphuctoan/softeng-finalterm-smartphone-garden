import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "@utils/db";
import { v4 as uuidv4 } from "uuid";
import { UserModel } from "@models";
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

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await UserModel.getByEmail(email);
        if (!user) {
            return res.status(400).render("auth/pages/login", {
                error: "Email or password is incorrect."
            });
        }

        const passwordHash = await UserModel.getPasswordHash(user.id);
        const match = await bcrypt.compare(password, passwordHash);
        if (!match) {
            return res.status(400).render("auth/pages/login", {
                error: "Email or password is incorrect."
            });
        }

        const token = jwt.sign(
            { jti: uuidv4(), userId: user.id, roleName: user.roleName },
            process.env.JWT_SECRET as string,
            { expiresIn: "1w" }
        );
        res.cookie("authToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.redirect("/");
    }
    catch (e) {
        console.error("Login error:", e);
        return res.status(400).render("auth/pages/login", {
            error: "Email or password is incorrect."
        });
    }
}


export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, email, password } = registerSchema.parse(req.body);

        try {
            await UserModel.getByEmail(email);

            return res.status(409).render("auth/pages/register", {
                error: "Email này đã được sử dụng."
            });
        } catch (e) {}

        const passwordHash = await bcrypt.hash(password, 10);
        await UserModel.add({
            name,
            email,
            password: passwordHash,
            roleName: "customer"
        });

        return res.redirect("/login");
    } catch (e) {
        // Zod validation hoặc các lỗi khác
        console.error("Register error:", e);
        const msg = e instanceof z.ZodError
            ? e.errors.map(err => err.message).join(", ")
            : "Registration failed, please try again later";
        return res.status(400).render("auth/pages/register", {
            error: msg
        });
    }
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

export function checkLogin(req: Request, res: Response, next: NextFunction) {
    if (!req.cookies.authToken) {
        res.redirect("/login");
        return;
    }

    next();
}

export function getLoginPage(req: Request, res: Response) {
    if (req.cookies.authToken) {
        res.redirect("/");
    } else {
        res.render("auth/pages/login");
    }
}

export function getRegisterPage(req: Request, res: Response) {
    res.render("auth/pages/register");
}