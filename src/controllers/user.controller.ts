import bcrypt from "bcrypt";
import { User } from "@interfaces";
import { UserModel } from "@models";
import { handleError } from "@utils/errors";
import { Request, Response } from "express";
import { passwordSchema, roleSchema, updateSchema } from "@utils/schemas";

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

export async function getMyProfile(req: Request, res: Response) {
    try {
        const me = await UserModel.getById(req.auth?.userId);

        res.json(userToProfile(me));
    } catch (error) {
        handleError(error, res);
    }
}

export async function updateMyProfile(req: Request, res: Response) {
    try {
        const userId = req.auth?.userId;
        const updateData = updateSchema.parse(req.body);

        const me = await UserModel.update({
            id: userId,
            ...updateData
        });

        res.json(userToProfile(me));
    } catch (error) {
        handleError(error, res);
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

        res.send("Password changed!");
    } catch (error) {
        handleError(error, res);
    }
}

export async function getAll(req: Request, res: Response) {
    try {
        const users = await UserModel.getAll();

        res.json(users);
    } catch (error) {
        handleError(error, res);
    }
}

export async function getById(req: Request, res: Response) {
    try {
        const userId = Number(req.params.id);

        const user = await UserModel.getById(userId);

        res.json(user);
    } catch (error) {
        handleError(error, res);
    }
}

export async function updateRole(req: Request, res: Response) {
    try {
        const userId = Number(req.params.id);
        const updatedRole = roleSchema.parse(req.body).role;

        const user = await UserModel.update({
            id: userId,
            roleName: updatedRole
        });

        res.json(user);
    } catch (error) {
        handleError(error, res);
    }
}