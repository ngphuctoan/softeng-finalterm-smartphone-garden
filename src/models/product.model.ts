import prisma from "@utils/db";
import { Product } from "@interfaces";
import { ItemFromDB, itemToJson } from "@models";
import { productSelect, SpecFromDB } from "@utils/selects";

type ProductFromDB = Omit<Product, "baseSpecs" | "items"> & { baseSpecs: SpecFromDB[], items: ItemFromDB[] };

function productToJson(product: ProductFromDB): Product {
    return {
        ...product,
        baseSpecs: Object.fromEntries(
            product.baseSpecs.map(baseSpec => [ baseSpec.spec.name, baseSpec.value ])
        ),
        items: product.items.map(itemToJson)
    }
}

export async function getAllBaseProducts() {
    const products = await prisma.product.findMany({
        select: productSelect
    });

    return products.map(productToJson);
}