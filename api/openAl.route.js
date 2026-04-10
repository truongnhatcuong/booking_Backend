import Express from "express";
import {
  chatController,
  generatePost,
  chatTestController,
  generateMiniStats,
  parseVoiceCommand,
  streamTTS,
} from "../controller/openai.Controller.js";

const routerOpenAi = Express.Router();

routerOpenAi.post("/", chatController);
routerOpenAi.post("/generate-post", generatePost);
routerOpenAi.post("/test", chatTestController);
routerOpenAi.post("/mini-stats", generateMiniStats);
routerOpenAi.post("/voice/parse", parseVoiceCommand);
routerOpenAi.get("/tts", streamTTS);
export default routerOpenAi;
