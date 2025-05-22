import express from "express";
import {
  discounts,
  getDiscountController,
  getAllDiscount,
  DeleteDisCount,
} from "../controller/discount.Controller.js";

const disCoutRouter = express.Router();

disCoutRouter.post("/", discounts);
disCoutRouter.get("/", getDiscountController);
disCoutRouter.get("/getAll", getAllDiscount);
disCoutRouter.delete("/:id", DeleteDisCount);
export default disCoutRouter;
