import NotFoundError from "../errors/not-found.error.js";
import {
  AuditLogCustomerBooking,
  logCancelBooking,
  logCheckIn,
  logCheckOut,
} from "../lib/auditLog.js";
import { prisma } from "../lib/client.js";
import { sendBookingMail } from "../lib/mailer.js";
import { pusher } from "../lib/Pusher.js";
import {
  BookingRepo,
  CancelledBookingRepo,
  confirmStatusRepo,
  FindRoom,
  getAllBookingRepo,
  getBookingForUserRepo,
  overlappingBooking,
  removeBookingUserRepo,
} from "../repositories/booking.repo.js";
import { findGuestUnique } from "../repositories/user.repo.js";

export async function bookingService({
  customerId,
  checkInDate,
  checkOutDate,
  totalGuests,
  specialRequests,
  bookingSource,
  totalAmount,
  discountId = "",
  pricePerNight,
  roomId,
  guestId,
}) {
  if (guestId) {
    const checkGuest = await findGuestUnique(guestId);
    if (!checkGuest) {
      throw new NotFoundError("Khách hàng (guest) không được tìm thấy");
    }
  }

  const overlapBooking = await overlappingBooking(
    checkInDate,
    checkOutDate,
    customerId,
    guestId
  );

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
  const room = await FindRoom(roomId);

  if (overlapBooking) {
    throw new NotFoundError(`Bạn đã có đặt phòng trước đó `);
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
    guestId,
  });

  const name = booking.customer.user.firstName + booking.customer.user.lastName;
  const to = booking.customer.user.email;
  const roomName = room.roomNumber;
  await pusher.trigger("admin-channel", "new-booking", {
    customer:
      booking.customer.user.firstName + " " + booking.customer.user.lastName,
    room: roomName,
  });
  // await sendBookingMail({
  //   to,
  //   name,
  //   roomName,
  //   checkInDate,
  //   checkOutDate,
  // });
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
  const overlapBooking = await overlappingBooking(
    checkInDate,
    checkOutDate,
    customerId
  );
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

  if (overlapBooking) {
    throw new Error(
      `Bạn đã có đặt phòng . Vui lòng chọn khoảng thời gian khác.`
    );
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
