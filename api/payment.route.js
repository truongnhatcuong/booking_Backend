import express from "express";
import {
  payMentBooking,
  payMentBookingEmployee,
  webhookPayment,
} from "../controller/payment.Controller.js";

const routerPayment = express.Router();

routerPayment.post("/", payMentBooking);
routerPayment.post("/employee", payMentBookingEmployee);
routerPayment.post("/webhook/payos", webhookPayment);

export default routerPayment;
