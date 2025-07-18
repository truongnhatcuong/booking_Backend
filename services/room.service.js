import NotFoundError from "../errors/not-found.error.js";
import {
  addImageToRoomRepo,
  createRoomRepo,
  deletedRoomRepo,
  deleteImageToRoomRepo,
  findBookedDateRangesRepo,
  getAllRoomRepo,
  getRoomCustomerRepo,
  getRoomIdRepo,
  getRoomsByRoomTypeIdRepo,
  updateRoomRepo,
} from "../repositories/room.repo.js";

export async function createRoomService({
  roomNumber,
  floor,
  status,
  notes,
  roomTypeId,
  imageUrls,
}) {
  const newRoom = await createRoomRepo({
    roomNumber,
    floor,
    status,
    notes: notes ? notes : null,
    roomTypeId,
    imageUrls,
  });
  return newRoom;
}

export async function getAllRoomService(
  checkIn,
  checkOut,
  customer,
  roomType,
  search,
  page,
  limit
) {
  const skip = (page - 1) * limit;
  const take = limit;

  const { data, total } = await getAllRoomRepo(
    checkIn,
    checkOut,
    customer,
    roomType,
    search,
    skip,
    take
  );
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function deleteRoomService(id) {
  const deletedRoom = await deletedRoomRepo(id);
  return deletedRoom;
}

export async function updateRoomService(
  id,
  { roomNumber, floor, status, notes, roomTypeId }
) {
  const updatedRoom = await updateRoomRepo(id, {
    roomNumber,
    floor,
    status,
    notes,
    roomTypeId,
  });
  return updatedRoom;
}

export async function deleteImageToRoomService(id) {
  const deletedImage = await deleteImageToRoomRepo(id);
  return deletedImage;
}

export async function addRoomImageService({ roomId, imageUrls }) {
  const addedImage = await addImageToRoomRepo({ roomId, imageUrls });
  return addedImage;
}

export async function getRoomCustomerService(
  checkIn,
  checkOut,
  customer,
  roomType
) {
  const getRoomCustomer = await getRoomCustomerRepo(
    checkIn,
    checkOut,
    customer,
    roomType
  );
  return getRoomCustomer;
}

export async function getRoomsByRoomTypeIdService(id) {
  const room = await getRoomsByRoomTypeIdRepo(id);
  return room;
}

export async function getRoomByIdService(id) {
  const room = await getRoomIdRepo(id);
  return room;
}

export async function getBookedDatesService(roomId) {
  const bookings = await findBookedDateRangesRepo(roomId);
  return bookings.map((booking) => ({
    start: new Date(booking.checkInDate).toISOString().split("T")[0],
    end: new Date(booking.checkOutDate).toISOString().split("T")[0],
    status: booking.status,
  }));
}
