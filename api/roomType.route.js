import express from "express";
import {
  addAmenity,
  createRoomTypeController,
  DeleteRoomType,
  getAllRoomTypes,
  getRoomTypesById,
  removeAmenity,
  updateRoomType,
} from "../controller/roomtype.Controller.js";

const routerRoomtype = express.Router();
routerRoomtype.post("/", createRoomTypeController);
routerRoomtype.get("/", getAllRoomTypes);
routerRoomtype.get("/:id", getRoomTypesById);
routerRoomtype.put("/:id", updateRoomType);
routerRoomtype.delete("/:id", DeleteRoomType);
routerRoomtype.post("/:id/amenities", addAmenity);
routerRoomtype.delete("/:id/amenities", removeAmenity);

export default routerRoomtype;
