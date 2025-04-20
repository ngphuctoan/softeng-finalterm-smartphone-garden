import prisma from "@utils/db";
import { Item } from "@interfaces";
import { SpecModel } from "@models";
import { itemSelect } from "@utils/selects";

export type ItemFromDB = Omit<Item, "specs"> & { specs: SpecModel.SpecFromDB[] };

export function itemToJson(item: ItemFromDB): Item {
    return {
        ...item,
        specs: SpecModel.arrayToSpecs(item.specs)
    };
}

export async function getForProduct(productId: string): Promise<Item[]> {
    const items = await prisma.item.findMany({
        where: { productId },
        select: itemSelect
    });

    return items.map(itemToJson);
}

export async function getById(id: number): Promise<Item> {
    const item = await prisma.item.findUnique({
        where: { id },
        select: itemSelect
    });

    if (!item) {
        throw new Error("No item found.");
    }

    return itemToJson(item);
}

export async function add({ productId, price, stock, specs }: Omit<Item, "id">): Promise<Item> {
    const item = await prisma.item.create({
        data: {
            product: {
                connect: { id: productId }
            },
            price,
            stock,
            specs: {
                create: SpecModel.specsToConnect(specs)
            }
        },
        select: itemSelect
    });

    return itemToJson(item);
}