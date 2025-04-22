import { ItemController, UserController } from "@controllers";
import { Item, Product } from "@interfaces";
import { checkForRoles } from "@middlewares/roles.middleware";
import { ItemModel, ProductModel } from "@models";
import { itemSchema, productSchema } from "@utils/schemas";
import { Request, Response } from "express";
import { Router } from "express";

const dashboardRoutes = Router();

dashboardRoutes.use(checkForRoles("administrator", "manager"));

dashboardRoutes.get("/dashboard",
    UserController.getUserNameAndRoleName,
    (req: Request, res: Response) =>
        res.render("dashboard/pages/index", {
            activeNav: "/",
            userName: res.locals.userName
        })
);

dashboardRoutes.get("/dashboard/products",
    UserController.getUserNameAndRoleName,
    async (req: Request, res: Response) => {
        const products = await ProductModel.getAll();

        res.render("dashboard/pages/products", {
            products,
            activeNav: "/products",
            userName: res.locals.userName,
            getAllItemSpecsFromProduct: ProductModel.getAllItemSpecs
        });
    }
);

dashboardRoutes.post("/dashboard/products/add-item", async (req: Request, res: Response) => {
    const addData = itemSchema.parse(req.body) as Omit<Item, "id">;

    await ItemModel.add(addData);

    res.redirect("/dashboard/products");
});

dashboardRoutes.post("/dashboard/products/update-item", async (req: Request, res: Response) => {
    const id = Number(req.query?.id);
    const updateData = itemSchema.partial().parse(req.body);

    await ItemModel.update(id, updateData);

    res.redirect("/dashboard/products");
});

dashboardRoutes.post("/dashboard/products/add-product", async (req: Request, res: Response) => {
    const addData = productSchema.parse(req.body) as Omit<Product, "items">;

    await ProductModel.add(addData);

    res.redirect("/dashboard/products");
});


dashboardRoutes.post("/dashboard/products/update-product", async (req: Request, res: Response) => {
    const { id, ...updateData } = productSchema.partial().parse(req.body);

    if (id) {
        await ProductModel.update(id, updateData);
    }

    res.redirect("/dashboard/products");
});

export default dashboardRoutes;