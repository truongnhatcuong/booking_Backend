import express from "express";
import { createRoom, getAllRoom } from "../controller/room.Controller.js";

const routerRoom = express.Router();

routerRoom.post("/", createRoom);
routerRoom.get("/", getAllRoom);
export default routerRoom;
