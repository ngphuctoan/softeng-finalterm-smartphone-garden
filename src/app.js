import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import { authenticate } from "./middlewares/jwt.js";
import { PrismaClient } from "./generated/prisma/index.js";

const prisma = new PrismaClient();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.set("view engine", "pug");
app.set("views", "./src/views");

app.get("/", (req, res) => {
    res.send("Hello, world!");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/dashboard", authenticate, async (req, res) => {
    res.render("dashboard", {
        user: await prisma.user.findUnique({
            where: { id: req.decoded.userId },
            select: {
                id: false,
                name: true,
                email: true,
                password: false
            }
        })
    });
});

app.use("/api/v1", authRoutes);

export default app;