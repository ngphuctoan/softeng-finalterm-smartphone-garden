import { Router } from "express";
import guard from "express-jwt-permissions";
import { UserController } from "@controllers";

const userRoutes = Router();

const checker = guard({ requestProperty: "auth" });

userRoutes.route("/users")
    .get(checker.check("user:read"), UserController.getAll);

userRoutes.route("/users/:id")
    .get(checker.check("user:read"), UserController.getById);

userRoutes.route("/users/:id/change-role")
    .post(checker.check("user:update-role"), UserController.updateRole);

userRoutes.route("/profile")
    .get(checker.check("profile:read"), UserController.getMyProfile)
    .patch(checker.check("profile:update"), UserController.updateMyProfile);

userRoutes.route("/profile/change-password")
    .get(checker.check("profile:change-password"), UserController.updateMyPassword);

export default userRoutes;