import express from "express";
import employeeRegister, {
  DeleteEmployeeCotroller,
  getAllEmployee,
  disableUser,
} from "../controller/employee.Controller.js";
import { authAdmin } from "../lib/authAdmin.js";

const employeeRouter = express.Router();

employeeRouter.post("/employee", authAdmin, employeeRegister);
employeeRouter.get("/employee", getAllEmployee);
employeeRouter.put("/employee/disabled/:id", authAdmin, disableUser);
employeeRouter.delete("/employee/:id", DeleteEmployeeCotroller);
export default employeeRouter;
