import { JwtPayload } from "jsonwebtoken";
import "express-session";

declare global {
    namespace Express {
        interface Request {
            auth?: JwtPayload
        }
    }
}

declare module "express-session" {
    interface SessionData {
        cart: number[]
    }
}