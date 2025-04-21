import { ProductModel } from "@models";
import { Request, Response } from "express";
import { productSchema } from "@utils/schemas";

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