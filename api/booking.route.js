import Express from "express";
import { CustomerBooking } from "../controller/booking.Controller.js";
import { authCustomer } from "../lib/authCustomer.js";

const RouterBooking = Express.Router();

RouterBooking.post("/", authCustomer, CustomerBooking);

export default RouterBooking;
