import express from "express";
import signUpController, {
  loginController,
  updateUserController,
  getUserController,
  getAllCustomer,
  createCustomer,
  changePassword,
} from "../controller/user.controller.js";
import { authCustomer } from "../lib/authCustomer.js";
const routerUser = express.Router();

routerUser.post("/signUp", signUpController);
routerUser.post("/login", loginController);
routerUser.post("/createCustomer", createCustomer);
routerUser.put("/user/:id", updateUserController);
routerUser.post("/user/changePassword", authCustomer, changePassword);
routerUser.get("/customer", getAllCustomer);
routerUser.get("/user", authCustomer, getUserController);
routerUser.get("/customer", getAllCustomer);
export default routerUser;
