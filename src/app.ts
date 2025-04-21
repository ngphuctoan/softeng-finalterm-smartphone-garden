import cookieParser from "cookie-parser";
import express, { Request, Response } from "express";
import authMiddleware from "@middlewares/auth.middleware";
import errorHandlingMiddleware from "@middlewares/error.middleware";
import { dashboardRoutes, storeRoutes } from "@routes";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "pug");
app.set("views", "./src/views");

app.use("/public", express.static("./public"));

app.use("/",
    storeRoutes,
    // authMiddleware,
    dashboardRoutes,
    errorHandlingMiddleware
);

app.get("/404", (req: Request, res: Response) =>
    res.render("store/pages/404")
);

app.use((req: Request, res: Response) =>
    res.redirect("/404")
);

export default app;