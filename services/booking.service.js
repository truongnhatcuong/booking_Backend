import NotFoundError from "../errors/not-found.error.js";
import {
  BookingRepo,
  checkStatusBooking,
  payMentBookingRepo,
} from "../repositories/booking.repo.js";

export async function bookingService({
  customerId,
  checkInDate,
  checkOutDate,
  totalGuests,
  specialRequests,
  totalAmount,
  discountId,
  pricePerNight,
  roomId,
}) {
  if (!customerId) {
    throw new NotFoundError("Customer ID is required");
  }
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

  const booking = await BookingRepo(
    customerId,
    checkInDate,
    checkOutDate,
    totalGuests,
    specialRequests,
    totalAmount,
    discountId,
    pricePerNight,
    roomId
  );
  return booking;
}

export async function payMentBookingService({
  totalAmount,
  paymentMethod,
  bookingId,
}) {
  if (totalAmount <= 0) {
    throw new NotFoundError("Total amount must be greater than 0");
  }
  if (!paymentMethod) {
    throw new NotFoundError("Payment method is required");
  }
  if (!bookingId) {
    throw new NotFoundError("Booking ID is required");
  }
  const payment = await payMentBookingRepo(
    totalAmount,
    paymentMethod,
    bookingId
  );
  return payment;
}
