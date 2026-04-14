import Express from "express";
import {
  getRevenueTotalMonthController,
  getStatisticalController,
  CustomerCountByMonthController,
  getRevenueOnlineOfflineController,
  getTopRoomStats,
} from "../controller/statistical.Controller.js";

const dashboardRouter = Express.Router();

dashboardRouter.get("/", getStatisticalController);
dashboardRouter.get("/revenue-total-month", getRevenueTotalMonthController);
dashboardRouter.get("/customer-count-by-month", CustomerCountByMonthController);
dashboardRouter.get(
  "/revenue-online-offline",
  getRevenueOnlineOfflineController,
);
dashboardRouter.get("/top-rooms", getTopRoomStats);

export default dashboardRouter;
