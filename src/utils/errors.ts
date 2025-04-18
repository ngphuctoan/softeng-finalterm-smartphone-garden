import { ZodError } from "zod";
import { Response } from "express";

export function handleError(error: unknown, res: Response) {
    if (error instanceof ZodError) {
        return res.status(400).json({
            message: "Input error.",
            errors: error.errors
        });
    }

    if (error instanceof Error) {
        return res.status(404).send(error.message);
    }

    return res.status(500).send(error);
}