import NotFoundError from "../errors/not-found.error.js";
import { prisma } from "../lib/client.js";
import {
  addAmenityRepo,
  createRoomTypeRepo,
  deleteRoomTypeRepo,
  findNameRoomTypeRepo,
  getRoomTypeByIdRepo,
  getRoomTypeRepo,
  removeAmenityRepo,
  updateRoomTypeRepo,
} from "../repositories/room-type.repo.js";

export async function createRoomTypeService({
  name,
  description,
  basePrice,
  maxOccupancy,
  photoUrls,
}) {
  const price = Number(basePrice);
  const existingNameRoomType = await findNameRoomTypeRepo(name);
  if (existingNameRoomType) {
    throw new NotFoundError("Tên loại phòng đã tồn tại");
  }
  const createRoomType = await createRoomTypeRepo({
    name,
    description,
    price,
    maxOccupancy,
    photoUrls,
  });

  return createRoomType;
}

export async function getRoomTypeService(
  search = "",
  page = 1,
  limit = 10,
  order = "asc"
) {
  const currentPage = Math.max(Number(page) || 1, 1);
  const perPage = Math.max(Number(limit) || 10, 1);
  const pages = (currentPage - 1) * perPage;
  const { roomType, countRoomType } = await getRoomTypeRepo(
    search,
    pages,
    limit,
    order
  );

  return {
    roomType,
    pagination: {
      total: countRoomType,
      page: pages,
      limit: perPage,
      totalPages: Math.ceil(countRoomType / limit),
    },
  };
}

export async function getRoomTypeByIdService(id) {
  const getRoomTypeById = await getRoomTypeByIdRepo(id);
  if (!getRoomTypeById) {
    throw new NotFoundError("Id Không tồn tại");
  }
  return getRoomTypeById;
}

export async function updateRoomTypeService(
  id,
  { name, description, basePrice, maxOccupancy, photoUrls }
) {
  const getRoomTypeById = await getRoomTypeByIdRepo(id);
  if (!getRoomTypeById) {
    throw new NotFoundError("Id Không tồn tại");
  }
  const updateRoomtype = await updateRoomTypeRepo(id, {
    name,
    description,
    basePrice: Number(basePrice),
    maxOccupancy,
    photoUrls,
  });

  return { updateRoomtype, getRoomTypeById };
}

export async function DeleteRoomTypeService(id) {
  const getRoomTypeById = await getRoomTypeByIdRepo(id);
  if (!getRoomTypeById) {
    return null;
  }
  const deleted = await deleteRoomTypeRepo(id);
  return { deleted, getRoomTypeById };
}

export async function addAmenityToRoomTypeService(roomTypeId, amenityIds) {
  const roomType = await getRoomTypeByIdRepo(roomTypeId);
  if (!roomType) {
    throw new NotFoundError("Room type not found");
  }
  if (amenityIds.length === 0) {
    throw new NotFoundError("amenityIds must be a non-empty array");
  }
  const uniqueAmenityIds = [...new Set(amenityIds)];
  const amenities = await prisma.amenity.findMany({
    where: { id: { in: uniqueAmenityIds } },
    select: { id: true },
  });
  if (amenities.length !== amenityIds.length) {
    throw new NotFoundError("One or more amenities not found");
  }
  const resulted = await addAmenityRepo(roomTypeId, amenityIds);
  return resulted;
}

export async function removeAmenityService(roomTypeId, amenityId) {
  if (!amenityId) {
    throw new NotFoundError(`không tìm thấy ${amenityId}`);
  }
  const deleteAmenity = await removeAmenityRepo(roomTypeId, amenityId);
  return deleteAmenity;
}
