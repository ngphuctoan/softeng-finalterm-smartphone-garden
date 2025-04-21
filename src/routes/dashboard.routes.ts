import { ItemModel, ProductModel } from "@models";
import { itemSchema } from "@utils/schemas";
import { Request, Response } from "express";
import { Router } from "express";

const dashboardRoutes = Router();

dashboardRoutes.get("/dashboard", (req: Request, res: Response) =>
    res.render("dashboard/pages/index", { activeNav: "/" })
);

dashboardRoutes.get("/dashboard/products", async (req: Request, res: Response) => {
    const products = await ProductModel.getAll();

    res.render("dashboard/pages/products", {
        products,
        activeNav: "/products"
    });
});

dashboardRoutes.post("/dashboard/products/update-item", async (req: Request, res: Response) => {
    const id = Number(req.query?.id);
    const updateData = itemSchema.partial().parse(req.body);

    await ItemModel.update(id, updateData);

    res.redirect("/dashboard/products");
});

export default dashboardRoutes;