import {
  createRoomSchema,
  UpdateRoomSchema,
} from "../schemas/RoomtypeSchema.js";
import {
  addRoomImageService,
  createRoomService,
  deleteImageToRoomService,
  deleteRoomService,
  getAllRoomService,
  getBookedDatesService,
  getRoomByIdService,
  getRoomCustomerService,
  getRoomsByRoomTypeIdService,
  updateRoomService,
} from "../services/room.service.js";

export async function createRoom(req, res) {
  const parsed = createRoomSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }
  try {
    const newRoom = await createRoomService(req.body);
    return res
      .status(201)
      .json({ newRoom, message: "Thêm Mới Phòng Thành Công" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getAllRoom(req, res) {
  const { checkIn, checkOut, customer, roomType, search, page, limit, status } =
    req.query;

  try {
    const room = await getAllRoomService(
      checkIn,
      checkOut,
      customer,
      status,
      roomType,
      search,

      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 5
    );
    return res.status(200).json({ room, message: "Thành Công" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function deleteRoom(req, res) {
  const { id } = req.params;
  try {
    const deletedRoom = await deleteRoomService(id);
    return res.status(200).json({ deletedRoom, message: "Xóa Thành Công" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function updateRoom(req, res) {
  const { id } = req.params;
  const parsed = UpdateRoomSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  try {
    const updatedRoom = await updateRoomService(id, parsed.data);
    return res
      .status(200)
      .json({ updatedRoom, message: "Cập Nhật Thành Công" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function deleteImageToRoom(req, res) {
  const { id } = req.params;
  try {
    const deletedImage = await deleteImageToRoomService(id);
    return res.status(200).json({ deletedImage, message: "Xóa Thành Công" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function addImageToRoom(req, res) {
  const { id } = req.params;
  const { imageUrls } = req.body;
  try {
    const addedImage = await addRoomImageService({ roomId: id, imageUrls });
    return res.status(200).json({ addedImage, message: "Thêm Thành Công" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getRoomCustomer(req, res) {
  const { checkIn, checkOut, customer, roomType } = req.query;
  try {
    const roomCustomer = await getRoomCustomerService(
      checkIn,
      checkOut,
      customer,
      roomType
    );
    console.log("thong tin : " + checkIn, checkOut, customer, roomType);
    return res.status(200).json(roomCustomer);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
export async function getRoomsByRoomTypeId(req, res) {
  try {
    const { id } = req.params;
    const room = await getRoomsByRoomTypeIdService(id);
    return res.status(200).json({ room, message: "Thành Công !!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getRoomId(req, res) {
  const { id } = req.params;
  try {
    const room = await getRoomByIdService(id);
    return res.status(200).json({ room, message: "Thành Công !!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getBookedDates(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Room ID is required" });
  }

  try {
    const bookedDates = await getBookedDatesService(id);
    return res.status(200).json(bookedDates);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
