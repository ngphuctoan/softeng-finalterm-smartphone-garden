import { z } from "zod";
import { ProductModel } from "@models";
import { Request, Response } from "express";

const productSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    brand: z.string().min(1),
    category: z.string().min(1),
    tags: z.array(z.string()),
    description: z.string(),
    baseSpecs: z.record(z.string())
});

export async function renderCategoryPage(req: Request, res: Response) {
    const category = req.params.category;

    const products = await ProductModel.getAll();
    
    res.render("store/pages/category", {
        category,
        products,
        activeNav: `/${category}`,
        categoryPhotos: {
            smartphones: {
                link: "1596742578443-7682ef5251cd",
                author: "the_average_tech_guy"
            }
        }
    });
}

export async function renderProductPage(req: Request, res: Response) {
    try {
        const category = req.params.category;
        const id = req.params.productId;
        const product = await ProductModel.getById(id);

        if (product.category !== category) {
            res.redirect("/404");
            return;
        }

        let options: { [spec: string]: Set<string> } = {};
        let selectedOptions: { [spec: string]: string } = {};

        for (const item of product.items) {
            for (const [spec, value] of Object.entries(item.specs)) {
                if (!options[spec]) {
                    options[spec] = new Set();
                }

                options[spec].add(value);
            }
        }

        for (const spec of Object.keys(options)) {
            const queryValue = req.query[spec]?.toString();

            if (queryValue && options[spec].has(queryValue)) {
                selectedOptions[spec] = queryValue;
            } else {
                selectedOptions[spec] = Array.from(options[spec])[0];
            }
        }

        const isAvailable = product.items.some(
            item => Object.entries(selectedOptions).every(
                ([spec, value]) => item.specs[spec] === value
            )
        );

        res.render("store/pages/product", {
            product,
            options,
            selectedOptions,
            isAvailable,
            activeNav: `/${product.category}`
        });
    } catch (error) {
        console.error(error);
        res.redirect("/404");
    }
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