import {
  addImageToRoomRepo,
  createRoomRepo,
  deletedRoomRepo,
  deleteImageToRoomRepo,
  findBookedDateRangesRepo,
  findRoomForSeason,
  findRoomNumber,
  getAllRoomRepo,
  getRoomCustomerRepo,
  getRoomIdRepo,
  getRoomsByRoomTypeIdRepo,
  updateRoomRepo,
} from "../repositories/room.repo.js";

export async function createRoomService(data) {
  const newRoom = await createRoomRepo(data);
  return newRoom;
}

export async function getAllRoomService(
  checkIn,
  checkOut,
  customer,
  status,
  roomType,
  search,
  page,
  limit
) {
  const skip = (page - 1) * limit;
  const take = limit;
  const roomtypeArray = roomType
    ? Array.isArray(roomType)
      ? roomType
      : [roomType]
    : [];

  const { data, total } = await getAllRoomRepo(
    checkIn,
    checkOut,
    customer,
    status,
    roomtypeArray,
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

export async function updateRoomService(id, data) {
  if (data.roomNumber) {
    const findRoom = await findRoomNumber(data.roomNumber);
    if (findRoom && findRoom.id !== id) {
      throw new Error("Số Phòng Đã Tồn Tại ");
    }
  }
  const updatedRoom = await updateRoomRepo(id, data);
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
  function formatDateToLocal(dateString) {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 7);
    return date.toISOString().split("T")[0];
  }

  return bookings.map((booking) => ({
    start: formatDateToLocal(booking.checkInDate),
    end: formatDateToLocal(booking.checkOutDate),
    status: booking.status,
  }));
}

export async function calculatePriceRoomService(
  bookingStart,
  bookingEnd,
  roomId
) {
  const room = await findRoomForSeason(bookingStart, bookingEnd, roomId);
  if (!room) throw new Error("Không tìm thấy phòng.");

  const start = new Date(bookingStart);
  const end = new Date(bookingEnd);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  // Chuẩn hóa season trước khi dùng
  const seasons = room.seasonalRates.map((s) => ({
    start: new Date(s.startDate.setHours(0, 0, 0, 0)),
    end: new Date(s.endDate.setHours(0, 0, 0, 0)),
  }));

  let total = 0;

  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    const day = new Date(d);

    const isSeasonDay = seasons.some((s) => day >= s.start && day <= s.end);

    total += isSeasonDay
      ? Number(room.currentPrice)
      : Number(room.originalPrice);
  }

  const bookingSeason = seasons.some((s) => start >= s.start && start <= s.end);
  return {
    total,
    currentPrice: Number(room.currentPrice),
    originalPrice: Number(room.originalPrice),
    displayPrice: bookingSeason
      ? Number(room.currentPrice)
      : Number(room.originalPrice),
  };
}
