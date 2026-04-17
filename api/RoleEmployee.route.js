import express from "express";

import {
  CreateRoleEmployee,
  GetRoleEmployee,
  RoleEmployee,
  DeleteRoleEmployeeById,
  RemoveRole,
} from "../controller/roleEmployee.Controller.js";
import { authEmployee } from "../lib/authEmployee.js";
import { checkPermission } from "../middleware/permission.middleware.js";
import { PERMISSIONS } from "../middleware/permission.js";

const routerRoleEmployee = express.Router();

// authEmployee áp dụng cho toàn bộ router
routerRoleEmployee.use(authEmployee);
routerRoleEmployee.post("/", CreateRoleEmployee);
routerRoleEmployee.post(
  "/roleEmployee",
  checkPermission(PERMISSIONS.ROLE_MANAGE),
  RoleEmployee,
);
routerRoleEmployee.get(
  "/",
  checkPermission(PERMISSIONS.ROLE_MANAGE),
  GetRoleEmployee,
);
routerRoleEmployee.delete(
  "/:id",
  checkPermission(PERMISSIONS.ROLE_MANAGE),
  RemoveRole,
);
routerRoleEmployee.delete(
  "/removeRole/:id",
  checkPermission(PERMISSIONS.ROLE_MANAGE),
  DeleteRoleEmployeeById,
);

export default routerRoleEmployee;
