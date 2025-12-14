import Express from "express";
import {
  chatController,
  generatePost,
  chatTestController,
} from "../controller/openai.Controller.js";

const routerOpenAi = Express.Router();

routerOpenAi.post("/", chatController);
routerOpenAi.post("/generate-post", generatePost);
routerOpenAi.post("/test", chatTestController);

export default routerOpenAi;
