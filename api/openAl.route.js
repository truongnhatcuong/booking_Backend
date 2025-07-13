import Express from "express";
import { chatController } from "../controller/openAl.Controller.js";

const routerOpenAi = Express.Router();

routerOpenAi.post("/", chatController);

export default routerOpenAi;
