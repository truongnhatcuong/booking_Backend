import {
  bookingService,
  getAllBookingService,
} from "../services/booking.service.js";

export async function CustomerBooking(req, res) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!req.user.customer) {
    return res
      .status(403)
      .json({ message: "Tài khoản của bạn không phải khách hàng" });
  }
  let customerId = null;

  if (req.user?.customer?.id) {
    customerId = req.user.customer.id;
  }
  // Nếu không có user, thử lấy từ body
  else if (req.body.customerId) {
    customerId = req.body.customerId;
  }

  if (!customerId) {
    return res.status(400).json({ message: "Customer ID is required" });
  }

  const {
    checkInDate,
    checkOutDate,
    totalGuests,
    specialRequests,
    totalAmount,
    discountId,
    pricePerNight,
    roomId,
  } = req.body;

  try {
    const data = await bookingService({
      customerId,
      checkInDate,
      checkOutDate,
      totalGuests,
      specialRequests,
      totalAmount,
      discountId,
      pricePerNight,
      roomId,
    });
    return res.status(201).json({ message: "Đặt phòng thành công", data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getAllBooking(req, res) {
  try {
    const bookings = await getAllBookingService();
    return res.status(200).json({ bookings, message: "Thành Công" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
