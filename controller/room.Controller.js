import { createRoomSchema } from "../schemas/RoomtypeSchema.js";
import {
  createRoomService,
  getAllRoomService,
} from "../services/room.service.js";

export async function createRoom(req, res) {
  const parsed = createRoomSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0].message });
  }
  try {
    const newRoom = await createRoomService(req.body);
    return res
      .status(201)
      .json({ newRoom, message: "Thêm Mới Phòng Thành Công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getAllRoom(req, res) {
  try {
    const result = await getAllRoomService(req);
    return res.status(200).json({ result, message: "Thành Công" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
