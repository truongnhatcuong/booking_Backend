import express from "express";
import { payMentBooking } from "../controller/payment.Controller.js";

const routerPayment = express.Router();

routerPayment.post("/", payMentBooking);

export default routerPayment;
