import { Router } from "express";
import guard from "express-jwt-permissions";
import { ItemController, ProductController } from "@controllers";

const productRoutes = Router();

const checker = guard({ requestProperty: "auth" });

productRoutes.route("/products")
    .get(checker.check("product:read"), ProductController.getAll)
    .post(checker.check("product:add"), ProductController.add);

productRoutes.route("/products/:id")
    .get(checker.check("product:read"), ProductController.getById);

productRoutes.route("/products/:id/items")
    .get(checker.check("item:read"), ItemController.getForProduct)
    .post(checker.check("item:add"), ItemController.add);

export default productRoutes;