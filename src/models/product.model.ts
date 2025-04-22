import prisma from "@utils/db";
import { ItemModel, SpecModel } from "@models";
import { Item, Product } from "@interfaces";
import { productSelect } from "@utils/selects";
import { itemToJson } from "./item.model.js";

type ProductFromDB = Omit<Product, "tags" | "baseSpecs" | "items"> & {
    tags: { id: string }[],
    baseSpecs: SpecModel.SpecFromDB[],
    items: ItemModel.ItemFromDB[]
};

function productToJson(product: ProductFromDB): Product {
    return {
        ...product,
        tags: product.tags.map(tag => tag.id),
        baseSpecs: SpecModel.arrayToSpecs(product.baseSpecs),
        items: product.items.map(itemToJson).map(
            item => Object.fromEntries(
                Object.entries(item).filter(([key,]) => key !== "productId")
            ) as Omit<Item, "productId">
        )
    };
}

export async function getAll(): Promise<Product[]> {
    const products = await prisma.product.findMany({
        select: productSelect
    });

    return products.map(productToJson);
}

export async function getById(id: string): Promise<Product> {
    const product = await prisma.product.findUnique({
        where: { id },
        select: productSelect
    });

    if (!product) {
        throw new Error("No product found.");
    }

    return productToJson(product);
}

export async function add({ id, name, brand, category, tags, description, baseSpecs }: Omit<Product, "items">): Promise<Product> {
    const product = await prisma.product.create({
        data: {
            id,
            name,
            brand,
            category,
            tags: {
                connectOrCreate: tags.map(tag => ({
                    where: { id: tag },
                    create: { id: tag }
                }))
            },
            description,
            baseSpecs: {
                create: SpecModel.specsToConnect(baseSpecs)
            }
        },
        select: productSelect
    });

    return productToJson(product);
}

export async function update(id: string, { name, brand, category, tags, description, baseSpecs }: Partial<Omit<Product, "id" | "items">>): Promise<Product> {
    const updateData: any = { name, brand, category, description };

    if (tags) {
        updateData.tags = {
            connectOrCreate: tags.map(tag => ({
                where: { id: tag },
                create: { id: tag }
            }))
        };
    }

    if (baseSpecs) {
        updateData.baseSpecs = {
            deleteMany: {},
            create: SpecModel.specsToConnect(baseSpecs)
        };
    }
    
    const product = await prisma.product.update({
        where: { id },
        data: updateData,
        select: productSelect
    });

    return productToJson(product);
}

export function getAllItemSpecs(product: Product) {
    let specs: { [spec: string]: Set<string> } = {};

    for (const item of product.items) {
        for (const [spec, value] of Object.entries(item.specs)) {
            if (!specs[spec]) {
                specs[spec] = new Set();
            }

            specs[spec].add(value);
        }
    }

    return specs;
}