import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).send("Not logged in.");
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
        if (error) {
            return res.status(401).send("Invalid token.");
        }

        req.user = user;
        next();
    });
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
        { userId: user.id, roleId: user.roleId },
        process.env.JWT_SECRET, { expiresIn }
    );
}