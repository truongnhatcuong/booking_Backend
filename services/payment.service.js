import PayOS from "@payos/node";

import {
  deletePaymentRepo,
  payMentBookingRepo,
  webhookpaymentRepo,
} from "../repositories/payment.repo.js";
import NotFoundError from "../errors/not-found.error.js";
import { logPaymentSuccess } from "../lib/auditLog.js";

const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

export async function payMentBookingService({
  amount,
  paymentMethod,
  bookingId,
  status = "PENDING",
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
    await logPaymentSuccess(null, bookingId)
    return { message: "Payment recorded as cash" };
  }

  if (paymentMethod === "QR_CODE") {
    const returnUrl = `${process.env.FRONTEND_URL}/payment/success`;
    const cancelUrl = `${process.env.FRONTEND_URL}/payment/cancel`;

    // Generate a safe orderCode (< 9007199254740991)
    const orderCode = Math.floor(Math.random() * 1e12);

    // Max 25 characters for description
    const description = `Đặt phòng #${bookingId}`.slice(0, 25);

    payment = await payos.createPaymentLink({
      orderCode,
      amount,
      description,
      returnUrl,
      cancelUrl,
    });

    await payMentBookingRepo({
      amount,
      status: "PENDING",
      paymentMethod,
      bookingId,
      transactionId: String(orderCode),
    });



    return payment;
  }
}

export async function payMentBookingToEmployeeService({
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

  const payment = await payMentBookingRepo({
    amount,
    status,
    paymentMethod,
    bookingId,
  });

  return payment;
}

export async function webhookpaymentService({ orderCode, status }) {
  if (!orderCode) {
    throw new NotFoundError("Order code is required");
  }

  if (!status) {
    throw new NotFoundError("Status is required");
  }
  let payment = null;
  if (status == "PAID") {
    const payment = await webhookpaymentRepo({ orderCode });
    await logPaymentSuccess(null, payment.bookingId)
  }
  if (status == "CANCELLED") {
    payment = await deletePaymentRepo({ orderCode });
  }

  return payment;
}
