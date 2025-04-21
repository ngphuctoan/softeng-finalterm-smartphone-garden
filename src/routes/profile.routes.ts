import { Router } from "express";
import { UserController } from "@controllers";

const profileRoutes = Router();

profileRoutes.post("/profile/change-password", UserController.updateMyPassword);

export default profileRoutes;