import NotFoundError from "../errors/not-found.error.js";
import { payMentBookingRepo } from "../repositories/payment.repo.js";

export async function payMentBookingService({
  amount,
  paymentMethod,
  bookingId,
  status,
}) {
  if (amount <= 0) {
    throw new NotFoundError("Total amount must be greater than 0");
  }
  if (!paymentMethod) {
    throw new NotFoundError("Payment method is required");
  }
  if (!bookingId) {
    throw new NotFoundError("Booking ID is required");
  }

  let payment;
  if (paymentMethod === "CASH") {
    await payMentBookingRepo({ amount, status, paymentMethod, bookingId });
  }
  return payment;
}
