import { NextFunction, Request, Response, Router } from "express";
import { UserController } from "@controllers";
import { UserModel } from "@models";
import bcrypt from "bcrypt";

const profileRoutes = Router();

profileRoutes.get("/profile",
    UserController.getMyProfile,
    (req: Request, res: Response) => res.render("profile/pages/index", {
        profile: res.locals.userProfile,
        error: req.query.error
    })
);

profileRoutes.post("/profile/change-password",
    UserController.getMyProfile,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (req.body.password !== req.body.confirmPassword) {
                throw new Error("Passwords don't match.");
            }

            const user = await UserModel.getByEmail(res.locals.userProfile.email);
            const passwordHash = await UserModel.getPasswordHash(user.id);

            if (!await bcrypt.compare(req.body.oldPassword, passwordHash)) {
                throw new Error("Incorrect old password.");
            }

            next();
        } catch (error) {
            if (error instanceof Error) {
                res.redirect(`/profile?error=${error.message}`);
            }
        }
    },
    UserController.updateMyPassword
);

export default profileRoutes;