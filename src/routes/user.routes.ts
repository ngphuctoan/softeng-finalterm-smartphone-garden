import { Router, NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "express-jwt";
import guard from "express-jwt-permissions";
import {
    getMyProfile, updateMyProfile, updateMyPassword,
    getAllUsers, getUserById, updateUserRole
} from "../controllers/user.controller.js";

const userRoutes = Router();
const userRouteGroup = Router();

const checker = guard({ requestProperty: "auth" });

userRoutes.get("/", checker.check("user:read"), getAllUsers);

userRoutes.route("/me")
    .get(getMyProfile, checker.check("me:read"))
    .patch(updateMyProfile, checker.check("me:update"));
userRoutes.post("/me/change-password", checker.check("me:change-password"), updateMyPassword);

userRoutes.route("/:id").get(checker.check("user:read"), getUserById);
userRoutes.post("/:id/update-role", checker.check("user:update-role"), updateUserRole);

userRouteGroup.use("/users", userRoutes);
userRouteGroup.use(
    (
        err: UnauthorizedError,
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        if (err.code === "permission_denied") {
            res.status(404);
        }
    }
);

export default userRouteGroup;