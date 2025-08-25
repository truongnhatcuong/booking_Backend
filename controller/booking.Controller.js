import { hasUserPermission } from "../lib/hasUserPermission.js";
import {
  bookingService,
  bookingToEmpoyeeService,
  CancelledBookingService,
  confirmStatusService,
  getAllBookingService,
  getBookingForUserService,
  removeBookingEmployeeService,
  removeBookingUserService,
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
  const customerId = req.user.customer.id;

  if (!customerId) {
    return res.status(400).json({ message: "Customer ID is required" });
  }

  const {
    checkInDate,
    checkOutDate,
    totalGuests,
    specialRequests,
    bookingSource,
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
      bookingSource,
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
  const { idNumber, status, checkInDate, checkOutDate, totalAmount } =
    req.query;

  console.log("hi", idNumber, status, checkInDate, checkOutDate, totalAmount);

  try {
    const bookings = await getAllBookingService(
      idNumber,
      status,
      checkInDate,
      checkOutDate,
      totalAmount
    );
    return res.status(200).json({ bookings, message: "Thành Công" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function bookingToEmpoyee(req, res) {
  const {
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
  } = req.body;
  const user = req.user;
  try {
    const data = await bookingToEmpoyeeService({
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
    });

    if (!hasUserPermission(user, "BOOKING_CREATE")) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return res.status(201).json({ message: "Đặt phòng thành công", data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function confirmStatus(req, res) {
  const { id } = req.params;
  const user = req.user;
  if (!hasUserPermission(user, "BOOKING_UPDATE")) {
    return res.status(403).json({ message: "Forbidden" });
  }
  try {
    const result = await confirmStatusService(id);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

export async function cancelledBooking(req, res) {
  const { id } = req.params;
  const user = req.user;
  if (!hasUserPermission(user, "BOOKING_UPDATE")) {
    return res.status(403).json({ message: "Forbidden" });
  }
  try {
    const data = await CancelledBookingService(id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function getBookingForUser(req, res) {
  const customerId = req.user.customer.id;
  try {
    const data = await getBookingForUserService(customerId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function removeBookingUser(req, res) {
  const { id } = req.params;
  const userId = req.user.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const data = await removeBookingUserService(id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function removeBookingEmployee(req, res) {
  const { id } = req.params;
  const user = req.user;

  if (!hasUserPermission(user, "BOOKING_DELETE")) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const data = await removeBookingEmployeeService(id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}
