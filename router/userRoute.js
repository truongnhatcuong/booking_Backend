import express from "express";
import signUp, {
  getUser,
  logIn,
  updateUser,
} from "../controller/userController.js";
import { authCustomer } from "../lib/authCustomer.js";
const routerUser = express.Router();

routerUser.post("/signUp", signUp);
routerUser.post("/login", logIn);
routerUser.get("/user", authCustomer, getUser);
routerUser.put("/updateUser/:id", updateUser);
export default routerUser;
