import Express from "express";
import {
  chatController,
  generatePost,
} from "../controller/openai.Controller.js";

const routerOpenAi = Express.Router();

routerOpenAi.post("/", chatController);
routerOpenAi.post("/generate-post", generatePost);

export default routerOpenAi;
