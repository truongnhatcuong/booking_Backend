import express from "express";

const routerMaintenance = express.Router();
import {
  CreateMaintenance,
  deleteMaintenance,
  GetMaintenance,
  UpdateMaintenance,
} from "../controller/maintenance.Controller.js";

import { authEmployee } from "../lib/authEmployee.js";

routerMaintenance.post("/", authEmployee, CreateMaintenance);
routerMaintenance.get("/", authEmployee, GetMaintenance);
routerMaintenance.put("/:id", authEmployee, UpdateMaintenance);
routerMaintenance.delete("/:id", deleteMaintenance);
export default routerMaintenance;
