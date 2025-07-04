import express from "express";
import {
  discounts,
  getDiscountController,
  getAllDiscount,
  DeleteDisCount,
} from "../controller/discount.Controller.js";
import { authEmployee } from "../lib/authEmployee.js";

const disCoutRouter = express.Router();

disCoutRouter.post("/", authEmployee, discounts);
disCoutRouter.get("/", authEmployee, getDiscountController);
disCoutRouter.get("/getAll", authEmployee, getAllDiscount);
disCoutRouter.delete("/:id", authEmployee, DeleteDisCount);
export default disCoutRouter;
