import Express from "express";
import {
  getRevenueTotalMonthController,
  getStatisticalController,
  CustomerCountByMonthController,
  getRevenueOnlineOfflineController,
} from "../controller/statistical.Controller.js";

const dashboardRouter = Express.Router();

dashboardRouter.get("/", getStatisticalController);
dashboardRouter.get("/revenue-total-month", getRevenueTotalMonthController);
dashboardRouter.get("/customer-count-by-month", CustomerCountByMonthController);
dashboardRouter.get(
  "/revenue-online-offline",
  getRevenueOnlineOfflineController
);

export default dashboardRouter;
