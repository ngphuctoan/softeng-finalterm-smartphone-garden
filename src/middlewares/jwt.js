import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

export async function authenticate(req, res, next) {
    const token = req.cookies["auth_token"];

    if (!token) {
        return res.status(401).send("Not logged in.");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (
            await prisma.authTokenLogout.findUnique({
                where: { jti: decoded.jti }
            }
        )) {
            return res.status(401).send("Not logged in.");
        }

        req.decoded = decoded;
        next();
    } catch (error) {
        return res.status(401).send("Invalid token.");
    }
}

export function authoriseRole(requiredRoleId) {
    return function (req, res, next) {
        if (req.user.roleId !== requiredRoleId) {
            return res.status(403).send("Insufficient priviledges.");
        }

        next();
    }
}

export function generateToken(user, expiresIn = "1w") {
    return jwt.sign(
        {
            jti: uuidv4(),
            userId: user.id,
            roleId: user.roleId
        },
        process.env.JWT_SECRET, { expiresIn }
    );
}