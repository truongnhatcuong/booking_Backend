import express from "express";
import employeeRegister from "../controller/employeeController.js";

const employeeRouter = express.Router();

employeeRouter.post("/employeeRegister", employeeRegister);

export default employeeRouter;
