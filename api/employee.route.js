import express from "express";
import employeeRegister, {
  DeleteEmployeeCotroller,
  getAllEmployee,
  disableUser,
  updateEmployee,
} from "../controller/employee.Controller.js";
import { authEmployee } from "../lib/authEmployee.js";
import { PERMISSIONS } from "../middleware/permission.js";
import { checkPermission } from "../middleware/permission.middleware.js";
const employeeRouter = express.Router();

employeeRouter.use(authEmployee);

employeeRouter.post(
  "/employee",
  checkPermission(PERMISSIONS.USER_CREATE),
  employeeRegister,
);
employeeRouter.get(
  "/employee",
  checkPermission(PERMISSIONS.USER_READ),
  getAllEmployee,
);
employeeRouter.put(
  "/employee/disabled/:id",
  checkPermission(PERMISSIONS.USER_UPDATE),
  disableUser,
);
employeeRouter.delete(
  "/employee/:id",
  checkPermission(PERMISSIONS.USER_DELETE),
  DeleteEmployeeCotroller,
);
employeeRouter.put(
  "/employee/:id",
  checkPermission(PERMISSIONS.USER_UPDATE),
  updateEmployee,
);

export default employeeRouter;
