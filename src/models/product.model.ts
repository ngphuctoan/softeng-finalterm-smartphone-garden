import prisma from "@utils/db";
import { ItemModel, SpecModel } from "@models";
import { Product } from "@interfaces";
import { productSelect } from "@utils/selects";

export type ProductFromDB = Omit<Product, "baseSpecs" | "items"> & { baseSpecs: SpecModel.SpecFromDB[], items: ItemModel.ItemFromDB[] };

export function productToJson(product: ProductFromDB): Product {
    return {
        ...product,
        baseSpecs: SpecModel.arrayToSpecs(product.baseSpecs),
        items: product.items.map(ItemModel.itemToJson)
    };
}

export async function getAll(): Promise<Product[]> {
    const products = await prisma.product.findMany({
        select: productSelect
    });

    return products.map(productToJson);
}

export async function getById(id: number): Promise<Product> {
    const product = await prisma.product.findUnique({
        where: { id },
        select: productSelect
    });

    if (!product) {
        throw new Error("No product found.");
    }

    return productToJson(product);
}

export async function add({ name, description, baseSpecs }: Omit<Product, "id" | "items">): Promise<Product> {
    const product = await prisma.product.create({
        data: {
            name,
            description,
            baseSpecs: {
                create: SpecModel.specsToConnect(baseSpecs)
            }
        },
        select: productSelect
    });

    return productToJson(product);
}