export const specSelect = {
    spec: {
        select: { name: true }
    },
    value: true
};

export const itemSelect = {
    id: true,
    productId: true,
    price: true,
    stock: true,
    specs: { select: specSelect }
};

export const productSelect = {
    id: true,
    name: true,
    description: true,
    baseSpecs: { select: specSelect },
    items: { select: itemSelect }
}