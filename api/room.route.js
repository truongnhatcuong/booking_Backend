import express from "express";
import {
  addImageToRoom,
  createRoom,
  deleteImageToRoom,
  deleteRoom,
  getAllRoom,
  updateRoom,
  getRoomId,
  getRoomCustomer,
  getRoomsByRoomTypeId,
  getBookedDates,
} from "../controller/room.Controller.js";
import { authEmployee } from "../lib/authEmployee.js";

const routerRoom = express.Router();

routerRoom.post("/", createRoom);
routerRoom.get("/", authEmployee, getAllRoom);
routerRoom.get("/customer", getRoomCustomer);
routerRoom.get("/:id", getRoomId);
routerRoom.delete("/:id", deleteRoom);
routerRoom.put("/:id", updateRoom);
routerRoom.delete("/images/:id", deleteImageToRoom);
routerRoom.post("/images/:id", addImageToRoom);
routerRoom.get("/roomtype/:id", getRoomsByRoomTypeId);
routerRoom.get("/:id/booked-dates", getBookedDates);

export default routerRoom;
