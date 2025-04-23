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
    brand: true,
    category: true,
    tags: {
        select: { id: true }
    },
    description: true,
    createdAt: true,
    baseSpecs: { select: specSelect },
    items: { select: itemSelect }
};

export const userSelect = {
    id: true,
    name: true,
    email: true,
    role: {
        select: { name: true }
    }
}