import cookieParser from "cookie-parser";
import express, { Request, Response } from "express";
import authMiddleware from "@middlewares/auth.middleware";
import { authRoutes, userRoutes, productRoutes, itemRoutes } from "@routes";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.set("view engine", "pug");
app.set("views", "./src/views");

app.use("/api/v1", authMiddleware, authRoutes, userRoutes, productRoutes, itemRoutes);

app.get("/login", async (req: Request, res: Response) => res.render("auth/login"));

export default app;