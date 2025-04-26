import { NextFunction, Response } from "express";
import { Request } from "express-jwt";

export function checkForRoles(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.auth?.roleName || "";

        if (roles.includes(userRole)) {
            return next();
        }

        throw new Error("Access denied.");
    }
}