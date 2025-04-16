import express from "express";
import amenityCreate, {
  amenityDelete,
  amenityGet,
} from "../controller/amenity.Controller.js";

const amenityRouter = express.Router();
amenityRouter.get("/", amenityGet);
amenityRouter.post("/", amenityCreate);
amenityRouter.delete("/:id", amenityDelete);

export default amenityRouter;
