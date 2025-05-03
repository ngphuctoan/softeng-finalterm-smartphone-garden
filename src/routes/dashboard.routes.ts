import { Router } from "express";
import { checkForRoles } from "@middlewares/roles.middleware";
import { DashboardController, UserController, RecordsController } from "@controllers";

const dashboardRoutes = Router();

dashboardRoutes.use(checkForRoles("administrator", "manager"));

dashboardRoutes.get("/dashboard",
    UserController.getUserNameAndRoleName,
    DashboardController.getDashboard
);

dashboardRoutes.get("/dashboard/products",
    UserController.getUserNameAndRoleName,
    DashboardController.getProducts
);
dashboardRoutes.post("/dashboard/products/add-item", DashboardController.addItem);
dashboardRoutes.post("/dashboard/products/update-item", DashboardController.updateItem);

dashboardRoutes.post("/dashboard/products/add-product", DashboardController.addProduct);
dashboardRoutes.post("/dashboard/products/update-product", DashboardController.updateProduct);

dashboardRoutes.get("/dashboard/users",
    checkForRoles("administrator"),
    UserController.getUserNameAndRoleName,
    DashboardController.getUsers
);
dashboardRoutes.post("/dashboard/users/:id/update-role",
    checkForRoles("administrator"),
    UserController.updateRole
);

dashboardRoutes.get("/dashboard/records",
    UserController.getUserNameAndRoleName,
    DashboardController.getRecords
);

dashboardRoutes.get("/dashboard/records/export-csv", RecordsController.exportCSV);

export default dashboardRoutes;