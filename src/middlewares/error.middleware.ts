import { NextFunction, Request, Response } from "express";

export default function errorHandlingMiddleware(error: any, req: Request, res: Response, next: NextFunction) {
    console.error(error);
    res.status(404);
    next();
}