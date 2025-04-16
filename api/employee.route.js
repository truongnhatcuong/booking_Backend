import express from "express";
import employeeRegister, {
  DeleteEmployeeCotroller,
} from "../controller/employee.Controller.js";
import { authAdmin } from "../lib/authAdmin.js";

const employeeRouter = express.Router();

employeeRouter.post("/employee", authAdmin, employeeRegister);
employeeRouter.delete("/employee/:id", DeleteEmployeeCotroller);
export default employeeRouter;
