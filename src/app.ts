import path from "path";
import cookieParser from "cookie-parser";
import express, { Request, Response } from "express";
import authMiddleware from "@middlewares/auth.middleware";
import errorHandlingMiddleware from "@middlewares/error.middleware";
import { authRoutes, userRoutes, productRoutes, itemRoutes } from "@routes";
import { ProductModel } from "@models";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "pug");
app.set("views", "./src/views");

app.use("/public", express.static("./public"));

app.get("/", async (req: Request, res: Response) => {
    res.render("store/pages/index", {
        activeNav: "/",
        carouselSlides: [
            {
                photo: {
                    link: "1565536421966-1e4aec32c7e7",
                    author: "alexandar_todov"
                },
                title: "Welcome to Smartphone Garden \u{1f338}",
                description: "Where your smartphone blossoms",
                align: "center",
                active: true,
                ctaButton: {
                    href: "#bestSellers",
                    label: "Our best-sellers!"
                }
            },
            {
                photo: {
                    link: "1600340048140-909329c17ac1",
                    author: "itsomidarmin"
                },
                title: "Pick your perfect phone \u{1f4f1}",
                description: "From flagship beasts to budget-friendly buds",
                align: "end",
                active: false,
                ctaButton: {
                    href: "/smartphones",
                    label: "Browse for products"
                }
            },
            {
                photo: {
                    link: "1648553847712-b32cf94e7bd1?",
                    author: "radoslavbali"
                },
                title: "For tech lovers, from tech lovers \u{2764}",
                description: "Curated, compared and delivered with care",
                align: "start",
                active: false,
                ctaButton: {
                    href: "/contact",
                    label: "Contact us"
                }
            }
        ],
        bestSellers: await ProductModel.getAll()
    });
});

app.get("/contact", (req: Request, res: Response) => res.render("store/pages/contact", { activeNav: "/contact" }));

app.get("/404", (req: Request, res: Response) => res.render("store/pages/404"));

app.use("/",
    authRoutes,
    userRoutes,
    productRoutes,
    itemRoutes,
    errorHandlingMiddleware
);

app.use((req: Request, res: Response) => res.redirect("/404"));

export default app;