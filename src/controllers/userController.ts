import { z } from "zod";
import bcrypt from "bcrypt";
import prisma from "../utils/db.js";
import { Request, Response } from "express";

interface FullUser {
    id: number,
    name: string,
    email: string,
    role: string
}

interface UserProfile {
    name: string,
    email: string
}

const updateSchema = z.object({
    name: z.string().min(1)
}).strict();

const passwordSchema = z.object({
    password: z.string().min(8, "Password too short.")
});

const roleSchema = z.object({
    role: z.string().min(1)
});

export async function getMyProfile(req: Request, res: Response) {
    const me = await prisma.user.findUnique({
        where: { id: req.auth?.userId },
        select: {
            name: true,
            email: true
        }
    }) as UserProfile;

    if (!me) {
        res.status(404).send("No user found.");
        return;
    }

    res.json(me);
}

export async function updateMyProfile(req: Request, res: Response) {
    const parsedUpdate = updateSchema.parse(req.body);

    const updatedMe = await prisma.user.update({
        where: { id: req.auth?.userId },
        data: parsedUpdate,
        select: {
            name: true,
            email: true
        }
    }) as UserProfile;

    res.json(updatedMe);
}

export async function updateMyPassword(req: Request, res: Response) {
    const { password } = passwordSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
        where: { id: req.auth?.userId },
        data: { password: passwordHash }
    });

    res.send("Password changed!");
}

export async function getAllUsers(req: Request, res: Response) {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: {
                select: { name: true }
            }
        }
    });

    res.json(
        users.map(user => (
            {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role.name
            } as FullUser
        ))
    );
}

export async function getUserById(req: Request, res: Response) {
    const userId = Number(req.params.id);

    if (isNaN(userId)) {
        res.status(400).send("Invalid user ID.");
        return;
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            name: true,
            email: true,
            role: {
                select: { name: true }
            }
        }
    });

    if (!user) {
        res.status(404).send("No user found.");
        return;
    }

    res.json(
        {
            id: userId,
            name: user.name,
            email: user.email,
            role: user.role.name
        } as FullUser
    );
}

export async function updateUserRole(req: Request, res: Response) {
    const userId = Number(req.params.id);
    const updatedRole = { name: roleSchema.parse(req.body).role };

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            role: {
                connectOrCreate: {
                    where: updatedRole,
                    create: updatedRole
                }
            }
        }
    });

    res.json(updatedUser);
}