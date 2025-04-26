import { Specs } from "@interfaces";

export interface Item {
    id: number,
    productId: string,
    price: number,
    stock: number,
    specs: Specs
}