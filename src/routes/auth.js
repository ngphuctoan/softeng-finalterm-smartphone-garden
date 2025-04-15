import express from "express";
import { login, register } from "../controllers/auth.js";
import { getBodyData } from "../middlewares/body-data.js";

const router = express.Router();

router.post("/login", getBodyData(["email", "password"]), login);
router.post("/register", getBodyData(["name", "email", "password"]), register, login);

export default router;