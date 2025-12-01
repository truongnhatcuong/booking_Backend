import express from "express";
import signUpController, {
  loginController,
  updateUserController,
  getUserController,
  getAllCustomer,
  createCustomer,
  changePassword,
  forgotPassword,
  resetPassword,
  disableUser,
  refreshToken,
  createGuest,
} from "../controller/user.controller.js";
import { authCustomer } from "../lib/authCustomer.js";
import { authEmployee } from "../lib/authEmployee.js";
import { getAuditLog } from "../controller/auditlog.Controller.js";

const routerUser = express.Router();

routerUser.post("/signUp", signUpController);
routerUser.post("/login", loginController);
routerUser.post("/createCustomer", authEmployee, createCustomer);
routerUser.post("/guest", authCustomer, createGuest);
routerUser.put("/user/:id", updateUserController);
routerUser.post("/user/changePassword", authCustomer, changePassword);
routerUser.get("/customer", getAllCustomer);
routerUser.get("/user", authCustomer, getUserController);
routerUser.get("/auditlog", getAuditLog);
routerUser.post("/forgot-password", forgotPassword);
routerUser.post("/reset-password", resetPassword);
routerUser.post("/reset-password", resetPassword);
routerUser.post("/refresh-token", refreshToken);
routerUser.put("/disabled/:id", authEmployee, disableUser);
export default routerUser;
