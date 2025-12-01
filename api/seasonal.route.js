import Express from "express";
import {
  createSeasonalRate,
  deleteSeasonalRate,
  getAllSeasonalRates,
  updateSeasonalRate,
} from "../controller/seasonal.Controller.js";
import { authEmployee } from "../lib/authEmployee.js";

const routerSeasonal = Express.Router();

routerSeasonal.post("/", authEmployee, createSeasonalRate);
routerSeasonal.get("/", getAllSeasonalRates);
routerSeasonal.delete("/:id", authEmployee, deleteSeasonalRate);
routerSeasonal.put("/:id", authEmployee, updateSeasonalRate);
export default routerSeasonal;
