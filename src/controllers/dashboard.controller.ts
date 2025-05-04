import { Request, Response } from "express";
import { ItemModel, ProductModel, UserModel, RecordsModel } from "@models";
import { itemSchema, productSchema, roleSchema } from "@utils/schemas";
import { Item, Product } from "@interfaces";

function serializeBigInts(obj: any): any {
    if (typeof obj === "bigint") return obj.toString();
    if (Array.isArray(obj)) return obj.map(serializeBigInts);
    if (obj && typeof obj === "object") {
        return Object.entries(obj).reduce((acc, [k, v]) => {
            acc[k] = serializeBigInts(v);
            return acc;
        }, {} as Record<string, any>);
    }
    return obj;
}

export function getDashboard(req: Request, res: Response) {
    res.render("dashboard/pages/index", {
        activeNav: "/",
        userName: res.locals.userName,
        roleName: res.locals.roleName,
    });
}

export async function getProducts(req: Request, res: Response) {
    const products = await ProductModel.getAll();
    res.render("dashboard/pages/products", {
        products,
        activeNav: "/products",
        userName: res.locals.userName,
        roleName: res.locals.roleName,
        getAllItemSpecsFromProduct: ProductModel.getAllItemSpecs,
    });
}

export async function addItem(req: Request, res: Response) {
    const addData = itemSchema.parse(req.body) as Omit<Item, "id">;
    await ItemModel.add(addData);
    res.redirect("/dashboard/products");
}

export async function updateItem(req: Request, res: Response) {
    const id = Number(req.query?.id);
    const updateData = itemSchema.partial().parse(req.body);
    await ItemModel.update(id, updateData);
    res.redirect("/dashboard/products");
}

export async function addProduct(req: Request, res: Response) {
    const addData = productSchema.parse(req.body) as Omit<Product, "items">;
    await ProductModel.add(addData);
    res.redirect("/dashboard/products");
}

export async function updateProduct(req: Request, res: Response) {
    const { id, ...updateData } = productSchema.partial().parse(req.body);
    if (id) await ProductModel.update(id, updateData);
    res.redirect("/dashboard/products");
}

export async function getUsers(req: Request, res: Response) {
    let users = await UserModel.getAll();
    users = users.filter(
        (u) => u.name !== "fallback" && u.email !== "fallback@smartphone-store"
    );
    res.render("dashboard/pages/users", {
        users,
        activeNav: "/users",
        userName: res.locals.userName,
        roleName: res.locals.roleName,
    });
}

export async function getRecords(req: Request, res: Response) {
    const rawRecords = await RecordsModel.getAllRecords();
    const records = rawRecords.map((r) => {
        const createdAt =
            r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt);
        const clean = serializeBigInts({ ...r, createdAt });
        clean.createdAtIso = createdAt.toISOString();
        clean.createdAtFormatted = createdAt.toLocaleDateString("vi-VN");
        clean.itemsJson = JSON.stringify(clean.items);
        return clean;
    });

    res.render("dashboard/pages/records", {
        records,
        activeNav: "/records",
        userName: res.locals.userName,
        roleName: res.locals.roleName,
    });
}
