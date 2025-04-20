import { z } from "zod";
import { ProductModel } from "@models";
import { Request, Response } from "express";

const productSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string(),
    baseSpecs: z.record(z.string())
});

export function renderProductPage(req: Request, res: Response) {
    res.render("");
}

export async function getAll(req: Request, res: Response) {
    const product = await ProductModel.getAll();
    res.json(product);
}

export async function getById(req: Request, res: Response) {
    const id = req.params.id;

    if (!id) {
        res.status(400).send("Invalid product ID.");
        return;
    }

    const product = await ProductModel.getById(id);
    res.json(product);
}

export async function add(req: Request, res: Response) {
    const product = await ProductModel.add(productSchema.parse(req.body));
    res.json(product);
}