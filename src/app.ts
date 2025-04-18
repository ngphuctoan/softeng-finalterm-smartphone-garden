import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import authMiddleware from "./middlewares/auth.middleware.js";
import { itemRoutes, productRoutes } from "@routes";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "pug");
app.set("views", "./src/views");

app.get("/profile", (req, res) => res.render("public/index", { name: "Hello" }));

app.get("/login", (req, res) => {
    if (req.auth?.userId) {
        res.redirect("/");
        return;
    }

    res.render("auth/login");
});

app.use("/api/v1", authMiddleware, authRoutes, userRoutes, productRoutes, itemRoutes);

export default app;