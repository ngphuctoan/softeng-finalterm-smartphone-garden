import cookieParser from "cookie-parser";
import session from "express-session";
import express, { Request, Response } from "express";
import errorHandlingMiddleware from "@middlewares/error.middleware";
import { authRoutes, dashboardRoutes, profileRoutes, storeRoutes } from "@routes";
import authMiddleware from "@middlewares/auth.middleware";
import { checkForRoles } from "@middlewares/roles.middleware";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 2592000000 }
}));

app.set("view engine", "pug");
app.set("views", "./src/views");

app.use("/public", express.static("./public"));

app.use("/",
    storeRoutes,
    authRoutes
);

app.use(authMiddleware);

app.use("/protected",
    checkForRoles("administrator", "manager"),
    express.static("./protected")
);

app.use("/",
    profileRoutes,
    dashboardRoutes,
    errorHandlingMiddleware
);

app.use((req: Request, res: Response) =>
    res.redirect("/404")
);

export default app;