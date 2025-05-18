import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "@interfaces";
import { UserModel } from "@models";
import { NextFunction, Request, Response } from "express";
import { passwordSchema, roleSchema, updateSchema } from "@utils/schemas";
import { z } from "zod";

export interface Profile {
    name: string,
    email: string
}

export function userToProfile(user: User): Profile {
    return {
        name: user.name,
        email: user.email
    };
}

export async function getMyProfile(req: Request, res: Response, next: NextFunction) {
    const userId = req.auth?.userId;
    const me = await UserModel.getById(userId);

    res.locals.userProfile = userToProfile(me);
    next();
}

export async function updateMyProfile(req: Request, res: Response) {
    try {
        const userId = req.auth?.userId;
        const updateData = updateSchema.parse(req.body);

        const me = await UserModel.update({
            id: userId,
            ...updateData
        });

        res.redirect("/profile");
    } catch (e) {
        const msg = e instanceof z.ZodError
            ? e.errors.map(err => err.message).join(", ")
            : "Update failed, please try again later";

        res.redirect(`/profile?=error=${msg}`);
    }
}

export async function updateMyPassword(req: Request, res: Response) {
    try {
        const userId = req.auth?.userId;
        const { password } = passwordSchema.parse(req.body);
        const passwordHash = await bcrypt.hash(password, 10);

        await UserModel.update({
            id: userId,
            password: passwordHash
        });

        res.redirect("/profile");
    } catch (e) {
        const msg = e instanceof z.ZodError
            ? e.errors.map(err => err.message).join(", ")
            : "Update failed, please try again later";

        res.redirect(`/profile?error=${msg}`);
    }
}

export async function getAll(req: Request, res: Response) {
    const users = await UserModel.getAll();
    res.json(users);
}

export async function getById(req: Request, res: Response) {
    const userId = Number(req.params.id);
    const user = await UserModel.getById(userId);

    res.json(user);
}

export async function getUserNameAndRoleName(req: Request, res: Response, next: NextFunction) {
    try {
        const decoded = jwt.decode(req.cookies.authToken);

        if (!decoded || typeof decoded === "string") {
            throw new Error();
        }

        const user = await UserModel.getById(decoded.userId);

        res.locals.userName = user.name;
        res.locals.roleName = user.roleName;
    } catch {} finally {
        next();
    }
}

export async function updateRole(req: Request, res: Response) {
    const userId = Number(req.params.id);
    const updatedRole = roleSchema.parse(req.body).role;
    const user = await UserModel.update({
        id: userId,
        roleName: updatedRole
    });

    res.json(user);
}