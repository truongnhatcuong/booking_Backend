import express from "express";
import employeeRegister, {
  DeleteEmployeeCotroller,
  getAllEmployee,
  disableUser,
  updateEmployee,
} from "../controller/employee.Controller.js";
import { authEmployee } from "../lib/authEmployee.js";

const employeeRouter = express.Router();

employeeRouter.post("/employee", employeeRegister);
employeeRouter.get("/employee", authEmployee, getAllEmployee);
employeeRouter.put("/employee/disabled/:id", authEmployee, disableUser);
employeeRouter.delete("/employee/:id", DeleteEmployeeCotroller);
employeeRouter.put("/employee/:id", authEmployee, updateEmployee);
export default employeeRouter;
