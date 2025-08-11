import express from "express";

import {
  CreateRoleEmployee,
  GetRoleEmployee,
  RoleEmployee,
  RemoveEmployeeRole,
} from "../controller/roleEmployee.Controller.js";
import { authEmployee } from "../lib/authEmployee.js";
//import { authAdmin } from "../lib/authAdmin.js";
const routerRoleEmployee = express.Router();
routerRoleEmployee.post("/", CreateRoleEmployee);
routerRoleEmployee.post("/roleEmployee/", authEmployee, RoleEmployee);
routerRoleEmployee.get("/", authEmployee, GetRoleEmployee);
routerRoleEmployee.delete("/:id", authEmployee, RemoveEmployeeRole);
export default routerRoleEmployee;
