import { Router } from "express";
import { addBaseProduct, addProduct, getAllBaseProducts, getBaseProductById } from "../controllers/productController.js";

const baseProductRoutes = Router();
const productRoutes = Router();

baseProductRoutes.route("/products")
    .get(getAllBaseProducts)
    .post(addBaseProduct);

baseProductRoutes.route("/products/:id")
    .get(getBaseProductById);

productRoutes.route("/products/:productId/items")
    .post(addProduct);

export { baseProductRoutes, productRoutes };