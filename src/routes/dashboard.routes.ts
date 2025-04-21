import { UserController } from "@controllers";
import { checkForRoles } from "@middlewares/roles.middleware";
import { ItemModel, ProductModel } from "@models";
import { itemSchema } from "@utils/schemas";
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
            userName: res.locals.userName
        });
    }
);

dashboardRoutes.post("/dashboard/products/update-item", async (req: Request, res: Response) => {
    const id = Number(req.query?.id);
    const updateData = itemSchema.partial().parse(req.body);

    await ItemModel.update(id, updateData);

    res.redirect("/dashboard/products");
});

export default dashboardRoutes;