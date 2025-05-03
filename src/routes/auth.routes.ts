import { Router } from "express";
import { Request, Response } from "express";
import { AuthController } from "@controllers";

const authRoutes = Router();

authRoutes.route("/login")
    .get(AuthController.getLoginPage)
    .post(AuthController.login);

authRoutes.route("/register")
    .get(AuthController.getRegisterPage)
    .post(
        AuthController.register,
        AuthController.logout,
        AuthController.login
    );

authRoutes.post("/logout",
    AuthController.logout,
    (req: Request, res: Response) => res.redirect("/")
);

export default authRoutes;