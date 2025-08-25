import NotFoundError from "../errors/not-found.error.js";
import {
  AuditLogCustomerBooking,
  logCancelBooking,
  logCheckIn,
  logCheckOut,
} from "../lib/auditLog.js";
import { prisma } from "../lib/client.js";
import {
  BookingRepo,
  CancelledBookingRepo,
  checkStatusBooking,
  confirmStatusRepo,
  getAllBookingRepo,
  getBookingForUserRepo,
  removeBookingUserRepo,
} from "../repositories/booking.repo.js";

export async function bookingService({
  customerId,
  checkInDate,
  checkOutDate,
  totalGuests,
  specialRequests,
  bookingSource,
  totalAmount,
  discountId,
  pricePerNight,
  roomId,
}) {
  if (checkInDate && checkOutDate) {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (checkIn >= checkOut) {
      throw new NotFoundError("Check-out date must be after check-in date");
    }
  }
  if (totalGuests <= 0) {
    throw new NotFoundError("Total guests must be greater than 0");
  }
  if (totalAmount <= 0) {
    throw new NotFoundError("Total amount must be greater than 0");
  }
  if (pricePerNight <= 0) {
    throw new NotFoundError("Price per night must be greater than 0");
  }
  if (!roomId) {
    throw new NotFoundError("Room ID is required");
  }

  const checkBooking = await checkStatusBooking(roomId);
  if (checkBooking.status !== "AVAILABLE") {
    throw new NotFoundError(`Phòng đã được ${checkBooking.status}`);
  }

  const booking = await BookingRepo({
    customerId,
    checkInDate,
    checkOutDate,
    totalGuests: totalGuests ? Number(totalGuests) : null,
    specialRequests,
    bookingSource,
    totalAmount,
    discountId,
    pricePerNight,
    roomId,
  });

  await AuditLogCustomerBooking(booking.customer.user, booking);
  return booking;
}

export async function getAllBookingService(
  idNumber,
  status = {},
  checkInDate,
  checkOutDate,
  totalAmount
) {
  const bookings = await getAllBookingRepo(
    idNumber,
    status,
    checkInDate,
    checkOutDate,
    totalAmount
  );
  return bookings;
}

export async function bookingToEmpoyeeService({
  customerId,
  checkInDate,
  checkOutDate,
  totalGuests,
  specialRequests,
  bookingSource,
  discountCode,
  pricePerNight,
  roomId,
  totalAmount,
}) {
  if (checkInDate && checkOutDate) {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (checkIn >= checkOut) {
      throw new NotFoundError("Check-out date must be after check-in date");
    }
  }
  if (totalGuests <= 0) {
    throw new NotFoundError("Total guests must be greater than 0");
  }

  if (pricePerNight <= 0) {
    throw new NotFoundError("Price per night must be greater than 0");
  }
  if (!roomId) {
    throw new NotFoundError("Room ID is required");
  }
  let discount = null;

  // nếu có mã giảm giá
  if (discountCode) {
    discount = await prisma.discount.findFirst({
      where: {
        code: discountCode,
        validFrom: { lte: new Date() },
        validTo: { gte: new Date() },
      },
    });
    if (!discount) {
      throw new Error("Mã giảm giá không hợp lệ hoặc đã hết hạn");
    }
  }

  if (totalAmount <= 0) {
    throw new NotFoundError("Tổng Tiền Phải Lớn Hơn không");
  }
  const checkBooking = await checkStatusBooking(roomId);
  if (checkBooking.status !== "AVAILABLE") {
    throw new NotFoundError(`Phòng đã được ${checkBooking.status}`);
  }

  const booking = await BookingRepo({
    customerId,
    checkInDate,
    checkOutDate,
    totalGuests,
    specialRequests,
    bookingSource,
    totalAmount,
    discountId: discount ? discount.id : null,
    pricePerNight,
    roomId,
  });
  await AuditLogCustomerBooking(booking.customer.user, booking);
  return booking;
}

export async function confirmStatusService(id) {
  const confirm = await confirmStatusRepo(id);
  if (confirm.status === "CHECKED_IN") {
    await logCheckIn(confirm?.customer?.user || null, confirm);
  } else if (confirm.status === "CHECKED_OUT") {
    await logCheckOut(confirm?.customer?.user || null, confirm);
  }
  return confirm;
}

export async function CancelledBookingService(id) {
  const cancelled = await CancelledBookingRepo(id);
  return cancelled;
}

export async function getBookingForUserService(id) {
  const result = await getBookingForUserRepo(id);
  return result;
}

export async function removeBookingUserService(id) {
  const result = await removeBookingUserRepo(id);
  if (!result) {
    throw new NotFoundError("Không tìm thấy đặt phòng");
  }
  await logCancelBooking(result.customer.user, result);
  return result;
}

export async function removeBookingEmployeeService(id) {
  const result = await removeBookingUserRepo(id);
  if (!result) {
    throw new NotFoundError("Không tìm thấy đặt phòng");
  }
  await logCancelBooking(result.customer.user, result);
  return result;
}
