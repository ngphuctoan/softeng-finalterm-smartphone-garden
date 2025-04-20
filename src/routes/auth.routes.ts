import { NextFunction, Router } from "express";
import { Request, Response } from "express";
import { AuthController } from "@controllers";

const authRoutes = Router();

authRoutes.route("/login")
    .get(AuthController.showLoginPage)
    .post(AuthController.login);

authRoutes.route("/register")
    .get(AuthController.showRegisterPage)
    .post(AuthController.register, AuthController.logout, AuthController.login);

authRoutes.post("/logout", AuthController.logout, (req, res) => res.redirect("/login"));

// authRoutes.post("/register", AuthController.register, AuthController.login);
// authRoutes.post("/logout", AuthController.logout);

export default authRoutes;