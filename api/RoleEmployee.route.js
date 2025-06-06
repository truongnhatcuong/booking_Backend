import express from "express";

import {
  CreateRoleEmployee,
  GetRoleEmployee,
  RoleEmployee,
} from "../controller/roleEmployee.Controller.js";
import { authEmployee } from "../lib/authEmployee.js";
//import { authAdmin } from "../lib/authAdmin.js";
const routerRoleEmployee = express.Router();
routerRoleEmployee.post("/", CreateRoleEmployee);
routerRoleEmployee.post("/roleEmployee/", RoleEmployee);
routerRoleEmployee.get("/", authEmployee, GetRoleEmployee);

export default routerRoleEmployee;
