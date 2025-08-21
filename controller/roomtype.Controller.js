/* eslint-disable no-unused-vars */

import {
  RoomTypeSchema,
  RoomUpdateTypeSchema,
} from "../schemas/RoomtypeSchema.js";

import {
  addAmenityToRoomTypeService,
  createRoomTypeService,
  DeleteRoomTypeService,
  getRoomTypeByIdService,
  getRoomTypeService,
  removeAmenityService,
  updateRoomTypeService,
} from "../services/room-type.service.js";

export async function createRoomTypeController(req, res) {
  const parsed = RoomTypeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0].message });
  }
  try {
    const roomType = await createRoomTypeService(parsed.data);
    res.status(200).json({ roomType, message: "Thêm Loại Phòng Thành Công" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getAllRoomTypes(req, res) {
  const { search, page, limit, order } = req.query;
  try {
    const roomTypes = await getRoomTypeService(search, page, limit, order);
    return res.status(200).json(roomTypes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getRoomTypesById(req, res) {
  const { id } = req.params;
  try {
    const result = await getRoomTypeByIdService(id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function updateRoomType(req, res) {
  const { id } = req.params;
  const parsed = RoomUpdateTypeSchema.safeParse(req.body);
  console.log(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }
  try {
    const { getRoomTypeById, updateRoomtype } = await updateRoomTypeService(
      id,
      parsed.data
    );
    return res
      .status(200)
      .json({ updateRoomtype, message: "cập nhật thành công" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function DeleteRoomType(req, res) {
  const { id } = req.params;

  try {
    const result = await DeleteRoomTypeService(id);
    if (!result) {
      return res.status(400).json({ message: `ID ${id} không tồn tại` });
    }
    return res
      .status(200)
      .json({ message: `Đã xóa thành công ID: ${result.deleted.id}` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function addAmenity(req, res) {
  try {
    const { amenityIds } = req.body;
    if (!Array.isArray(amenityIds) || amenityIds.length === 0) {
      return res
        .status(400)
        .json({ message: "amenityIds must be a non-empty array" });
    }
    const roomTypeAmenities = await addAmenityToRoomTypeService(
      req.params.id,
      amenityIds
    );
    return res
      .status(201)
      .json({ roomTypeAmenities, message: "Thêm thành công" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
export async function removeAmenity(req, res) {
  const { amenityId } = req.body;
  try {
    const deleted = await removeAmenityService(req.params.id, amenityId);
    return res
      .status(200)
      .json(`đã xóa thành công id : ${deleted.amenityId} từ RoomtypeAmenity`);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
