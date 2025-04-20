import { NextFunction, Request, Response } from "express";

export default function errorHandlingMiddleware(error: any, req: Request, res: Response, next: NextFunction) {
    res.status(error.status).send(error);
    next();
}