import Express from "express";
import {
  bookingToEmpoyee,
  CustomerBooking,
  getAllBooking,
  confirmStatus,
  cancelledBooking,
  getBookingForUser,
  removeBookingUser,
  removeBookingEmployee,
} from "../controller/booking.Controller.js";
import { authCustomer } from "../lib/authCustomer.js";
import { authEmployee } from "../lib/authEmployee.js";

const RouterBooking = Express.Router();

RouterBooking.post("/", authCustomer, CustomerBooking);
RouterBooking.post("/employee", authEmployee, bookingToEmpoyee);
RouterBooking.get("/", getAllBooking);

RouterBooking.get("/bookingUser", authCustomer, getBookingForUser);
RouterBooking.put("/:id", authEmployee, confirmStatus);
RouterBooking.put("/cancelled/:id", authEmployee, cancelledBooking);
RouterBooking.delete("/:id", authCustomer, removeBookingUser);
RouterBooking.delete("/employee/:id", authEmployee, removeBookingEmployee);
export default RouterBooking;
