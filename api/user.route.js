import express from "express";
import signUpController, {
  loginController,
  updateUserController,
  getUserController,
  getAllCustomer,
} from "../controller/user.controller.js";
import { authCustomer } from "../lib/authCustomer.js";
const routerUser = express.Router();

routerUser.post("/signUp", signUpController);
routerUser.post("/login", loginController);
routerUser.put("/user/:id", updateUserController);
routerUser.get("/user", authCustomer, getUserController);
routerUser.get("/customer", getAllCustomer);
export default routerUser;
