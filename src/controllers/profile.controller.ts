import { Request, Response, NextFunction } from "express";
import { UserModel } from "@models";
import bcrypt from "bcrypt";

export function renderProfile(req: Request, res: Response) {
    res.render("profile/pages/index", {
        profile: res.locals.userProfile,
        error: req.query.error,
    });
}

export async function validatePasswordChange(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        if (req.body.password !== req.body.confirmPassword) {
            throw new Error("Passwords don't match.");
        }

        const user = await UserModel.getByEmail(res.locals.userProfile.email);
        const passwordHash = await UserModel.getPasswordHash(user.id);

        if (!(await bcrypt.compare(req.body.oldPassword, passwordHash))) {
            throw new Error("Incorrect old password.");
        }

        next();
    } catch (error) {
        if (error instanceof Error) {
            res.redirect(`/profile?error=${error.message}`);
        }
    }
}
