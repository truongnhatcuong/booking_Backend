import {
  addImageToRoomRepo,
  createRoomRepo,
  deletedRoomRepo,
  deleteImageToRoomRepo,
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

export async function getAllRoomService() {
  const getRoom = getAllRoomRepo();
  return getRoom;
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

export async function getRoomCustomerService() {
  const getRoomCustomer = await getRoomCustomerRepo();
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
