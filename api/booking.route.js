import Express from "express";
import {
  CustomerBooking,
  getAllBooking,
} from "../controller/booking.Controller.js";
import { authCustomer } from "../lib/authCustomer.js";

const RouterBooking = Express.Router();

RouterBooking.post("/", authCustomer, CustomerBooking);
RouterBooking.get("/", getAllBooking);
export default RouterBooking;
