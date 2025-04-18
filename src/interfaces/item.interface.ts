import { Specs } from "@interfaces";

export interface Item {
    id: number,
    productId: number,
    price: number,
    stock: number,
    specs: Specs
}