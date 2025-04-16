import express from "express";
import { authenticate } from "../middlewares/jwt.js";
import { getBodyData } from "../middlewares/body-data.js";
import { login, register, logout } from "../controllers/auth.js";

const router = express.Router();

router.post("/login", getBodyData(["email", "password"]), login);
router.post("/register", getBodyData(["name", "email", "password"]), register, login);
router.post("/logout", authenticate, logout);

export default router;