import { ItemController, UserController, RecordsController } from "@controllers";
import { Item, Product } from "@interfaces";
import { checkForRoles } from "@middlewares/roles.middleware";
import { ItemModel, ProductModel, UserModel, RecordsModel } from "@models";
import { itemSchema, productSchema } from "@utils/schemas";
import { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { z } from "zod";
import { roleSchema } from "@utils/schemas";

const dashboardRoutes = Router();

dashboardRoutes.use(checkForRoles("administrator", "manager"));

dashboardRoutes.get("/dashboard",
    UserController.getUserNameAndRoleName,
    (req: Request, res: Response) =>
        res.render("dashboard/pages/index", {
            activeNav: "/",
            userName: res.locals.userName
        })
);

dashboardRoutes.get("/dashboard/products",
    UserController.getUserNameAndRoleName,
    async (req: Request, res: Response) => {
        const products = await ProductModel.getAll();

        res.render("dashboard/pages/products", {
            products,
            activeNav: "/products",
            userName: res.locals.userName,
            getAllItemSpecsFromProduct: ProductModel.getAllItemSpecs
        });
    }
);

dashboardRoutes.post("/dashboard/products/add-item", async (req: Request, res: Response) => {
  const addData = itemSchema.parse(req.body) as Omit<Item, "id">;

  await ItemModel.add(addData);

  res.redirect("/dashboard/products");
});

dashboardRoutes.post("/dashboard/products/update-item", async (req: Request, res: Response) => {
  const id = Number(req.query?.id);
  const updateData = itemSchema.partial().parse(req.body);

  await ItemModel.update(id, updateData);

  res.redirect("/dashboard/products");
});

dashboardRoutes.post("/dashboard/products/add-product", async (req: Request, res: Response) => {
  const addData = productSchema.parse(req.body) as Omit<Product, "items">;

  await ProductModel.add(addData);

  res.redirect("/dashboard/products");
});

dashboardRoutes.post("/dashboard/products/update-product", async (req: Request, res: Response) => {
    const { id, ...updateData } = productSchema.partial().parse(req.body);

  if (id) {
    await ProductModel.update(id, updateData);
  }

  res.redirect("/dashboard/products");
});

dashboardRoutes.get("/dashboard/users", async (req: Request, res: Response) => {
  let users = await UserModel.getAll();
  RecordsModel.getAllRecords();
  //  Fixed if you want to further revolution the code, add a column in the database with the name "is_backup" and filter in the model
  users = users.filter((user) => user.name != "fallback" && user.email != "fallback@smartphone-store");
  res.render("dashboard/pages/users", {
    users,
    activeNav: "/users",
    userName: res.locals.userName,
  });
});

dashboardRoutes.post("/dashboard/users/:id/update-role",
  UserController.updateRole
);

function serializeBigInts(obj: any): any {
  if (typeof obj === "bigint") return obj.toString();
  if (Array.isArray(obj))      return obj.map(serializeBigInts);
  if (obj && typeof obj === "object") {
    return Object.entries(obj).reduce((acc, [k, v]) => {
      acc[k] = serializeBigInts(v);
      return acc;
    }, {} as Record<string, any>);
  }
  return obj;
}

dashboardRoutes.get(
  "/dashboard/records",
  async (req: Request, res: Response) => {
    // 1. Lấy raw
    const rawRecords = await RecordsModel.getAllRecords();

    // 2. Map và sanitize
    const records = rawRecords.map((r) => {
      // đảm bảo createdAt là Date
      const createdAtDate =
        r.createdAt instanceof Date
          ? r.createdAt
          : new Date(r.createdAt);

      // convert BigInt → string
      const clean = serializeBigInts({ ...r, createdAt: createdAtDate });

      // thêm ISO string để truyền data-created-at
      clean.createdAtIso = createdAtDate.toISOString();

      // thêm chuỗi format ready‐to‐display
      clean.createdAtFormatted = createdAtDate.toLocaleDateString("vi-VN");

      // serialize items thành JSON (chứa toàn string, no BigInt)
      clean.itemsJson = JSON.stringify(clean.items);

      return clean;
    });

    // 3. Render chỉ với quân át chủ bài là records đã "sạch"
    res.render("dashboard/pages/records", {
      records,
      activeNav: "/records",
    });
  }
);

dashboardRoutes.get("/dashboard/records/export-csv", RecordsController.exportCSV);

export default dashboardRoutes;
