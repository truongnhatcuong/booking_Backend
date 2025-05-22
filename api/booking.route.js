import Express from "express";
import {
  bookingToEmpoyee,
  CustomerBooking,
  getAllBooking,
  confirmStatus,
  cancelledBooking,
  getBookingForUser,
  removeBookingUser,
} from "../controller/booking.Controller.js";
import { authCustomer } from "../lib/authCustomer.js";

const RouterBooking = Express.Router();

RouterBooking.post("/", authCustomer, CustomerBooking);
RouterBooking.post("/employee", bookingToEmpoyee);
RouterBooking.get("/", getAllBooking);
RouterBooking.get("/bookingUser", authCustomer, getBookingForUser);
RouterBooking.put("/:id", confirmStatus);
RouterBooking.put("/cancelled/:id", cancelledBooking);
RouterBooking.delete("/:id", authCustomer, removeBookingUser);
export default RouterBooking;
