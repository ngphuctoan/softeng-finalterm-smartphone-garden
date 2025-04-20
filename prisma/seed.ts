import bcrypt from "bcrypt";
import { User } from "@interfaces";
import { ItemModel, ProductModel, UserModel } from "@models";
import project from "../package.json" with { type: "json" };
import products from "./products.json" with { type: "json" };

const FALLBACK_USER: Omit<User, "id"> & { password: string } = {
    name: "fallback",
    email: `fallback@${project.name}`,
    password: "nhom11",
    roleName: "administrator"
};

async function main() {
    try {
        await UserModel.getByEmail(FALLBACK_USER.email);
    } catch {
        const passwordHash = await bcrypt.hash(FALLBACK_USER.password, 10);
        await UserModel.add({
            ...FALLBACK_USER,
            password: passwordHash
        });
    } finally {
        for (const product of products) {
            try {
                await ProductModel.getById(product.id);
            } catch {
                const { items, ...productData } = product;
                
                await ProductModel.add(productData);

                for (const item of items) {
                    await ItemModel.add({ ...item, productId: product.id });
                }
            }
        }
    }
}

main().catch((error: Error) => {
    console.error(error);
    process.exit(1);
});