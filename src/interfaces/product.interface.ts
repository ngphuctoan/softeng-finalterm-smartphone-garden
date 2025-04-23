import { Item, Specs } from "@interfaces";

export interface Product {
    id: string,
    name: string,
    brand: string,
    os: string,
    category: string,
    tags: string[],
    description: string | null,
    createdAt: Date,
    baseSpecs: Specs,
    items: Omit<Item, "productId">[]
}