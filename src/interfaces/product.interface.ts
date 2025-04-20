import { Item, Specs } from "@interfaces";

export interface Product {
    id: string,
    name: string,
    brand: string,
    category: string,
    tags: string[],
    description: string | null,
    baseSpecs: Specs,
    items: Omit<Item, "productId">[]
}