import { z } from "zod";
import { ItemModel } from "@models";
import { Request, Response } from "express";

const itemSchema = z.object({
    price: z.number().min(100000, "Price must be >= 100.000đ."),
    stock: z.number(),
    specs: z.record(z.string())
});

export async function getForProduct(req: Request, res: Response) {
    const productId = req.params.id;

    if (!productId) {
        res.status(400).send("Invalid product ID.");
        return;
    }

    const items = await ItemModel.getForProduct(productId);
    res.json(items);
}

export async function getById(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        res.status(400).send("Invalid item ID.");
        return;
    }

    const item = await ItemModel.getById(id);
    res.json(item);
}

export async function add(req: Request, res: Response) {
    const productId = req.params.id;

    if (!productId) {
        res.status(400).send("Invalid product ID.");
        return;
    }

    const product = await ItemModel.add({
        productId,
        ...itemSchema.parse(req.body)
    });
    res.json(product);
}