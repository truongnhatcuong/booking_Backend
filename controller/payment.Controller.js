import {
  payMentBookingService,
  payMentBookingToEmployeeService,
  webhookpaymentService,
} from "../services/payment.service.js";

export async function payMentBooking(req, res) {
  try {
    const { amount, paymentMethod, bookingId, status } = req.body;
    const payment = await payMentBookingService({
      amount,
      paymentMethod,
      bookingId,
      status,
    });
    console.log("Payment request:", { amount, paymentMethod, bookingId });

    if (paymentMethod === "QR_CODE" && payment?.checkoutUrl) {
      return res.status(200).json({
        status: "redirect",
        url: payment.checkoutUrl,
      });
    }

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

export async function payMentBookingEmployee(req, res) {
  try {
    const { amount, paymentMethod, bookingId, status } = req.body;
    const payment = await payMentBookingToEmployeeService({
      amount,
      paymentMethod,
      bookingId,
      status,
    });
    console.log("Payment request:", { amount, paymentMethod, bookingId });

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

export async function webhookPayment(req, res) {
  try {
    const { status, orderCode } = req.body;

    console.log("Webhook data:", { orderCode, status });
    if (!orderCode || !status) {
      throw new Error("Invalid webhook data");
    }

    // Handle the webhook payment logic here
    await webhookpaymentService({ orderCode, status });
    return res.status(200).json({ message: "Webhook received" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}
