import { Request } from "express";
import { expressjwt as jwt } from "express-jwt";

const authMiddleware = jwt({
    secret: process.env.JWT_SECRET as string,
    algorithms: ["HS256"],
    getToken: (req: Request): string | undefined => req.cookies?.authToken
}).unless({
    path: [
        "/",
        "/login",
        "/register",
        "/logout"
    ]
});

export default authMiddleware;