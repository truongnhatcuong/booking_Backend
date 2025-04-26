import { bookingService } from "../services/booking.service.js";

export async function CustomerBooking(req, res) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const customerId = req.user.customer.id;

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
