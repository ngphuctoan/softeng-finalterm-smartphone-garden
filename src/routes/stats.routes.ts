import { Router } from "express";
import { StatsController } from "@controllers";
import { checkForRoles } from "@middlewares/roles.middleware";

const statRoutes = Router();

statRoutes.use(checkForRoles("administrator", "manager"));

statRoutes.get("/stats/sales-over-time", StatsController.getSalesOverTime);
statRoutes.get("/stats/total-sales", StatsController.getTotalSales);
statRoutes.get("/stats/total-users", StatsController.getTotalUsers);
statRoutes.get("/stats/total-products", StatsController.getTotalProducts);
statRoutes.get("/stats/top-products", StatsController.getTopProducts);
statRoutes.get("/stats/record-statuses", StatsController.getRecordStatusCounts);

export default statRoutes;