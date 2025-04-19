import { createRoomRepo, getAllRoomRepo } from "../repositories/room.repo.js";

export async function createRoomService({
  roomNumber,
  floor,
  status,
  notes,
  roomTypeId,
}) {
  const newRoom = await createRoomRepo({
    roomNumber,
    floor,
    status,
    notes: notes ? notes : null,
    roomTypeId,
  });
  return newRoom;
}

export async function getAllRoomService() {
  const getRoom = getAllRoomRepo();
  return getRoom;
}
