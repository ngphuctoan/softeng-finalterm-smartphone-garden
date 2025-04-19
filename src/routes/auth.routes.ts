import { Router } from "express";
import { AuthController } from "@controllers";

const authRoutes = Router();

authRoutes.post("/login", AuthController.login);
authRoutes.post("/register", AuthController.register, AuthController.login);
authRoutes.post("/logout", AuthController.logout);

export default authRoutes;