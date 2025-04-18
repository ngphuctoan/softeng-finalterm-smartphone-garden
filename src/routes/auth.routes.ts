import { Router } from "express";
import { login, logout, register } from "../controllers/auth.controller.js";

const authRoutes = Router();

authRoutes.post("/login", login);
authRoutes.post("/register", register, login);
authRoutes.post("/logout", logout);

export default authRoutes;