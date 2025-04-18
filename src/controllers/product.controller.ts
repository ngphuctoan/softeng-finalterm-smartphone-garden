import { z } from "zod";
import prisma from "../utils/db.js";
import { Request, Response } from "express";

interface Specs {
    [name: string]: string,
}

interface BaseProduct {
    id: number,
    name: string,
    description: string,
    baseSpecs: Specs,
    products: Product[]
}

interface Product {
    id: number,
    price: number,
    stock: number,
    specs: Specs
}

const specsSchema = z.record(z.string());

const baseProductSchema = z.object({
    name: z.string(),
    description: z.string(),
    baseSpecs: specsSchema
});

const productSchema = z.object({
    price: z.number().min(100000, "Price must be >= 100.000đ."),
    stock: z.number(),
    specs: specsSchema
});

const specSelect = {
    spec: {
        select: { name: true }
    },
    value: true
}

const itemSelect = {
    id: true,
    price: true,
    stock: true,
    specs: { select: specSelect }
}

const productSelect = {
    id: true,
    name: true,
    description: true,
    baseSpecs: { select: specSelect },
    items: { select: itemSelect }
}

export async function getAllBaseProducts(req: Request, res: Response) {
    const baseProducts = await prisma.baseProduct.findMany({
        select: {
            id: true,
            name: true,
            description: true,
            baseSpecs: {
                select: {
                    spec: {
                        select: { name: true }
                    },
                    value: true
                }
            },
            products: {
                select: {
                    id: true,
                    price: true,
                    stock: true,
                    specs: {
                        select: {
                            spec: {
                                select: { name: true }
                            },
                            value: true
                        }
                    }
                }
            }
        }
    });

    res.json(
        baseProducts.map(baseProduct => ({
            ...baseProduct,
            baseSpecs: Object.fromEntries(
                baseProduct.baseSpecs.map(
                    baseSpec => [baseSpec.spec.name, baseSpec.value]
                )
            ) as Specs,
            products: baseProduct.products.map(product => ({
                ...product,
                specs: Object.fromEntries(
                    product.specs.map(
                        spec => [spec.spec.name, spec.value]
                    )
                ) as Specs
            } as Product))
        } as BaseProduct))
    );
}

export async function getBaseProductById(req: Request, res: Response) {
    const baseProductId = Number(req.params.id);

    if (isNaN(baseProductId)) {
        res.status(400).send("Invalid product ID.");
        return;
    }

    const baseProduct = await prisma.baseProduct.findUnique({
        where: { id: baseProductId },
        select: {
            id: true,
            name: true,
            description: true,
            baseSpecs: {
                select: {
                    spec: {
                        select: { name: true }
                    },
                    value: true
                }
            },
            products: {
                select: {
                    id: true,
                    price: true,
                    stock: true,
                    specs: {
                        select: {
                            spec: {
                                select: { name: true }
                            },
                            value: true
                        }
                    }
                }
            }
        }
    });

    if (!baseProduct) {
        res.status(404).send("No product found.");
        return;
    }

    res.json({
        ...baseProduct,
        baseSpecs: Object.fromEntries(
            baseProduct.baseSpecs.map(
                baseSpec => [baseSpec.spec.name, baseSpec.value]
            )
        ) as Specs,
        products: baseProduct.products.map(product => ({
            ...product,
            specs: Object.fromEntries(
                product.specs.map(
                    spec => [spec.spec.name, spec.value]
                )
            ) as Specs
        } as Product))
    } as BaseProduct);
}

export async function addBaseProduct(req: Request, res: Response) {
    const { name, description, baseSpecs } = baseProductSchema.parse(req.body);

    const baseProduct = await prisma.baseProduct.create({
        data: {
            name,
            description,
            baseSpecs: {
                create: Object.entries(baseSpecs).map(
                    ([name, value]) => ({
                        spec: {
                            connectOrCreate: {
                                where: { name },
                                create: { name }
                            }
                        },
                        value
                    })
                )
            }
        },
        select: {
            id: true,
            name: true,
            description: true,
            baseSpecs: {
                select: {
                    spec: {
                        select: { name: true }
                    },
                    value: true
                }
            }
        }
    });

    res.json({
        ...baseProduct,
        baseSpecs: Object.fromEntries(
            baseProduct.baseSpecs.map(
                baseSpec => [baseSpec.spec.name, baseSpec.value]
            )
        ) as Specs,
        products: []
    } as BaseProduct);
}

export async function addProduct(req: Request, res: Response) {
    const { price, stock, specs } = productSchema.parse(req.body);
    const baseProductId = Number(req.params.productId);

    if (isNaN(baseProductId)) {
        res.status(400).send("Invalid product ID.");
        return;
    }

    const product = await prisma.product.create({
        data: {
            price,
            stock,
            specs: {
                create: Object.entries(specs).map(
                    ([name, value]) => ({
                        spec: {
                            connectOrCreate: {
                                where: { name },
                                create: { name }
                            }
                        },
                        value
                    })
                )
            },
            baseProduct: {
                connect: { id: baseProductId }
            }
        },
        select: {
            id: true,
            price: true,
            stock: true,
            specs: {
                select: {
                    spec: {
                        select: { name: true }
                    },
                    value: true
                }
            }
        }
    });

    res.json({
        ...product,
        specs: Object.fromEntries(
            product.specs.map(
                spec => [spec.spec.name, spec.value]
            )
        ) as Specs
    } as Product);
}