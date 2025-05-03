import { Router } from "express";
import { AuthController, StoreController, UserController } from "@controllers";

const storeRoutes = Router();

storeRoutes.get("/",
    UserController.getUserNameAndRoleName,
    StoreController.getHomePage
);

storeRoutes.get("/products/:category",
    UserController.getUserNameAndRoleName,
    StoreController.getCategoryPage
);

storeRoutes.get("/products/:category/:productId",
    UserController.getUserNameAndRoleName,
    StoreController.getProductPage
);

storeRoutes.get("/cart",
    AuthController.checkLogin,
    UserController.getUserNameAndRoleName,
    StoreController.getCartPage
);

storeRoutes.post("/cart/add-item", StoreController.addItemToCart);

storeRoutes.post("/cart/subtract-item", StoreController.substractItemFromCart);

storeRoutes.post("/cart/remove-item", StoreController.removeItemFromCart);

storeRoutes.get("/contact",
    UserController.getUserNameAndRoleName,
    StoreController.getContactPage
);

storeRoutes.get("/404",
    UserController.getUserNameAndRoleName,
    StoreController.get404Page
);

export default storeRoutes;