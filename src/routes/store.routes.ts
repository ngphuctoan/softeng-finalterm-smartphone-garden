import fs from "fs";
import path from "path";
import { ProductModel, UserModel } from "@models";
import { Router } from "express";
import { Request, Response } from "express";
import { UserController } from "@controllers";

const storeRoutes = Router();

storeRoutes.get("/",
    UserController.getUserNameAndRoleName,
    async (req: Request, res: Response) => {
        const carouselSlides = [
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
            }, {
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
            }, {
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
        ];

        res.render("store/pages/index", {
            carouselSlides,
            activeNav: "/",
            userName: res.locals.userName,
            showDashboard: ["administrator", "manager"].includes(res.locals.roleName),
            bestSellers: await ProductModel.getAll()
        });
    }
);

storeRoutes.get("/products/:category",
    UserController.getUserNameAndRoleName,
    async (req: Request, res: Response) => {
        const category = req.params.category;
        const categoryPhotos = {
            smartphones: {
                link: "1596742578443-7682ef5251cd",
                author: "the_average_tech_guy"
            }
        };

        const products = await ProductModel.getAll();
        
        res.render("store/pages/category", {
            category,
            products,
            categoryPhotos,
            activeNav: `/products/${category}`,
            userName: res.locals.userName,
            showDashboard: ["administrator", "manager"].includes(res.locals.roleName)
        });
    }
);

storeRoutes.get("/products/:category/:productId",
    UserController.getUserNameAndRoleName,
    async (req: Request, res: Response) => {
        const category = req.params.category;
        const id = req.params.productId;
        const product = await ProductModel.getById(id);

        if (product.category !== category) {
            res.redirect("/404");
            return;
        }

        const previewDir = path.join(".", "public", "images", "products", id, "previews");
        const slides = fs.readdirSync(previewDir).filter(name => name.startsWith("slide-"));

        let options: { [spec: string]: Set<string> } = {};
        let selectedOptions: { [spec: string]: string } = {};

        for (const item of product.items) {
            for (const [spec, value] of Object.entries(item.specs)) {
                if (!options[spec]) {
                    options[spec] = new Set();
                }

                options[spec].add(value);
            }
        }

        for (const spec of Object.keys(options)) {
            const queryValue = req.query[spec]?.toString();

            if (queryValue && options[spec].has(queryValue)) {
                selectedOptions[spec] = queryValue;
            } else {
                selectedOptions[spec] = Array.from(options[spec])[0];
            }
        }

        const isAvailable = product.items.some(
            item => Object.entries(selectedOptions).every(
                ([spec, value]) => item.specs[spec] === value
            )
        );

        res.render("store/pages/product", {
            product,
            slides,
            options,
            selectedOptions,
            isAvailable,
            activeNav: `/products/${product.category}`,
            userName: res.locals.userName,
            showDashboard: ["administrator", "manager"].includes(res.locals.roleName)
        });
    }
);

storeRoutes.get("/contact",
    UserController.getUserNameAndRoleName,
    (req: Request, res: Response) =>
        res.render("store/pages/contact", {
            activeNav: "/contact",
            userName: res.locals.userName
        })
);

storeRoutes.get("/404",
    UserController.getUserNameAndRoleName,
    (req: Request, res: Response) =>
        res.render("store/pages/404", {
            userName: res.locals.userName,
            showDashboard: ["administrator", "manager"].includes(res.locals.roleName)
        })
);

export default storeRoutes;