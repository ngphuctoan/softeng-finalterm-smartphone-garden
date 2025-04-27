import express from "express";
import { authenticate } from "../middlewares/jwt.js";
import { parseBody } from "../middlewares/parsers.js";
import { login, register, logout } from "../controllers/auth.js";

const router = express.Router();

router.post("/login", parseBody(["email", "password"]), login);
router.post("/register", parseBody(["name", "email", "password"]), register, login);
router.post("/logout", authenticate, logout);

export default router;