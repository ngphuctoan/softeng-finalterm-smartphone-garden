import { NextFunction, Request, Response, Router } from "express";
import { UserController } from "@controllers";
import { UserModel } from "@models";
import bcrypt from "bcrypt";

const profileRoutes = Router();

profileRoutes.get("/profile",
    UserController.getMyProfile,
    (req: Request, res: Response) => res.render("profile/pages/index", {
        profile: res.locals.userProfile
    })
);

profileRoutes.post("/profile/change-password",
    UserController.getMyProfile,
    async (req: Request, res: Response, next: NextFunction) => {
        const user = await UserModel.getByEmail(res.locals.userProfile.email);
        const passwordHash = await UserModel.getPasswordHash(user.id);

        if (!await bcrypt.compare(req.body.oldPassword, passwordHash)) {
            res.send("Unauthorized.");
            return;
        }

        next();
    },
    UserController.updateMyPassword
);

export default profileRoutes;