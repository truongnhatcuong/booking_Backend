import express from "express";
import amenityCreate, {
  amenityDelete,
  amenityGet,
  amenityUpdate,
} from "../controller/amenity.Controller.js";

const amenityRouter = express.Router();
amenityRouter.get("/", amenityGet);
amenityRouter.post("/", amenityCreate);
amenityRouter.delete("/:id", amenityDelete);
amenityRouter.put("/:id", amenityUpdate);
export default amenityRouter;
