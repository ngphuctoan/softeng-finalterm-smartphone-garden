import { Item, Specs } from "@interfaces";

export interface Product {
    id: number,
    name: string,
    description: string | null,
    baseSpecs: Specs,
    items: Item[]
}