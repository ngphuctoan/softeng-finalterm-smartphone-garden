import prisma from "@utils/db";
import { ItemModel, SpecModel } from "@models";
import { Item, Product } from "@interfaces";
import { productSelect } from "@utils/selects";
import { itemToJson } from "./item.model.js";

type ProductFromDB = Omit<Product, "baseSpecs" | "items"> & { baseSpecs: SpecModel.SpecFromDB[], items: ItemModel.ItemFromDB[] };

function productToJson(product: ProductFromDB): Product {
    return {
        ...product,
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

export async function add({ id, name, description, baseSpecs }: Omit<Product, "items">): Promise<Product> {
    const product = await prisma.product.create({
        data: {
            id,
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