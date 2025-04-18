import { Router } from "express";
import guard from "express-jwt-permissions";
import { ItemController } from "@controllers";

const itemRoutes = Router();

const checker = guard({ requestProperty: "auth" });

itemRoutes.route("/items/:id")
    .get(checker.check("item:read"), ItemController.getById);

export default itemRoutes;