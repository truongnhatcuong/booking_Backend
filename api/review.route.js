import express from "express";
import {
  CreateReview,
  DeleteReview,
  GetAllReviews,
  GetReviewsByBookingId,
} from "../controller/review.Controller.js";
import { authCustomer } from "../lib/authCustomer.js";
import { authEmployee } from "../lib/authEmployee.js";

const routerReview = express.Router();

routerReview.post("/", authCustomer, CreateReview);
routerReview.get("/", authCustomer, GetReviewsByBookingId);
routerReview.get("/all", authEmployee, GetAllReviews);
routerReview.delete("/:id", authEmployee, DeleteReview);

export default routerReview;
