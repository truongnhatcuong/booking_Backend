import { payMentBookingService } from "../services/payment.service.js";

export async function payMentBooking(req, res) {
  try {
    const { amount, paymentMethod, bookingId, status } = req.body;
    const payment = await payMentBookingService({
      amount,
      paymentMethod,
      bookingId,
      status,
    });
    console.log(amount, paymentMethod, bookingId);

    return res.status(200).json({
      status: "success",
      message: "Payment successful",
      data: payment,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
}
