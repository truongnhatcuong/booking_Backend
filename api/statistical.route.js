import Express from "express";
import {
  getRevenueTotalMonthController,
  getStatisticalController,
  CustomerCountByMonthController,
  getRevenueOnlineOfflineController,
} from "../controller/statistical.Controller.js";

const dashboardRouter = Express.Router();

dashboardRouter.get("/dashboard", getStatisticalController);
dashboardRouter.get(
  "/dashboard/revenue-total-month",
  getRevenueTotalMonthController
);
dashboardRouter.get(
  "/dashboard/customer-count-by-month",
  CustomerCountByMonthController
);
dashboardRouter.get(
  "/dashboard/revenue-online-offline",
  getRevenueOnlineOfflineController
);

export default dashboardRouter;
