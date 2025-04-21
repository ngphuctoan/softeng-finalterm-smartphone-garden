import { ItemModel, ProductModel } from "@models";
import { itemSchema, productSchema } from "@utils/schemas";
import { Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";

const dashboardRoutes = Router();

dashboardRoutes.get("/dashboard", (req: Request, res: Response) => res.render("dashboard/pages/index", { activeNav: "/" }));

dashboardRoutes.route("/dashboard/products")
    .get(async (req: Request, res: Response) => {
        const products = await ProductModel.getAll();

        res.render("dashboard/pages/products", {
            products,
            activeNav: "/products"
        });
    });

dashboardRoutes.route("/dashboard/products/update-item/:id")
    .post(async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const updateData = itemSchema.partial().parse(req.body);

        await ItemModel.update({ id, ...updateData });

        res.redirect("/dashboard/products");
    });

export default dashboardRoutes;