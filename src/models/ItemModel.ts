import prisma from "@utils/db";
import { Item } from "@interfaces";
import { itemSelect, SpecFromDB } from "@utils/selects";

export type ItemFromDB = Omit<Item, "specs"> & { specs: SpecFromDB[] };

export function itemToJson(item: ItemFromDB): Item {
    return {
        ...item,
        specs: Object.fromEntries(
            item.specs.map(_spec => [ _spec.spec.name, _spec.value ])
        )
    }
}

export async function getAll(): Promise<Item[]> {
    const items = await prisma.product.findMany({ select: itemSelect });

    return items.map(itemToJson);
}

export async function getById(id: number): Promise<Item> {
    const item = await prisma.product.findUnique({
        where: { id },
        select: itemSelect
    });

    if (!item) {
        throw new Error("No item found.");
    }

    return itemToJson(item);
}

export async function add({ productId, price, stock, specs }: Item): Promise<Item> {
    const item = await prisma.item.create({
        data: {
            product: {
                connect: { id: productId }
            },
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
            }
        },
        select: itemSelect
    });

    return itemToJson(item);
}