import express from "express";
import {
  payMentBooking,
  webhookPayment,
} from "../controller/payment.Controller.js";

const routerPayment = express.Router();

routerPayment.post("/", payMentBooking);
routerPayment.post("/webhook/payos", webhookPayment);

export default routerPayment;
