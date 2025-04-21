import { Router } from "express";
import { Request, Response } from "express";
import { AuthController } from "@controllers";

const authRoutes = Router();

authRoutes.route("/login")
    .get((req: Request, res: Response) => {
        if (req.cookies.authToken) {
            res.redirect("/");
        } else {
            res.render("auth/pages/login");
        }
    })
    .post(AuthController.login);

authRoutes.route("/register")
    .get((req: Request, res: Response) =>
        res.render("auth/pages/register")
    )
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