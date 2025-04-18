import { z } from "zod";
import { ProductModel } from "@models";
import { handleError } from "@utils/errors";
import { Request, Response } from "express";

const productSchema = z.object({
    name: z.string(),
    description: z.string(),
    baseSpecs: z.record(z.string())
});

export async function getAll(req: Request, res: Response) {
    try {
        const product = await ProductModel.getAll();
        res.json(product);
    } catch (error) {
        handleError(error, res);
    }
}

export async function getById(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        res.status(400).send("Invalid product ID.");
        return;
    }

    try {
        const product = await ProductModel.getById(id);
        res.json(product);
    } catch (error) {
        handleError(error, res);
    }
}

export async function add(req: Request, res: Response) {
    try {
        const product = await ProductModel.add(productSchema.parse(req.body));
        res.json(product);
    } catch (error) {
        handleError(error, res);
    }
}