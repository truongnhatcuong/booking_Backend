import { prisma } from "../lib/client.js";

export async function createAuditLog({
  action,
  entity,
  entityId,
  userId,
  userType,
  details,
}) {
  return await prisma.auditLog.create({
    data: {
      action,
      entity,
      entityId,
      userId,
      userType,
      details,
    },
  });
}

export async function AuditLogCustomerBooking(user, booking) {
  return await prisma.auditLog.create({
    data: {
      action: "CREATE_BOOKING",
      entity: "Booking",
      entityId: booking.id,
      userId: user.id,
      userType: user.userType,
      details: `Người dùng ${user.firstName + " " + user.lastName} đã đặt phòng từ ${new Date(booking.checkInDate).toLocaleString()} đến ${new Date(booking.checkOutDate).toLocaleString()}`,
    },
  });
}

export async function logCancelBooking(user, booking) {
  return await createAuditLog({
    action: "CANCEL_BOOKING",
    entity: "Booking",
    entityId: booking.id,
    userId: user.id,
    userType: user.userType,
    details: `Người dùng ${user.firstName} ${user.lastName} đã huỷ đơn đặt phòng.`,
  });
}

// 📌 Khi check-in
export async function logCheckIn(user, booking) {
  return await createAuditLog({
    action: "CHECK_IN",
    entity: "Booking",
    entityId: booking.id,
    userId: user.id,
    userType: user.userType,
    details: `Khách đã nhận phòng lúc ${new Date().toLocaleString()}.`,
  });
}

// 📌 Khi check-out
export async function logCheckOut(user, booking) {
  return await createAuditLog({
    action: "CHECK_OUT",
    entity: "Booking",
    entityId: booking.id,
    userId: user.id,
    userType: user.userType,
    details: `Khách đã trả phòng lúc ${new Date().toLocaleString()}.`,
  });
}

// 📌 Khi thanh toán thành công
export async function logPaymentSuccess(user, booking) {
  return await createAuditLog({
    action: "PAYMENT_SUCCESS",
    entity: "Payment",
    entityId: booking.id,
    userId: user.id,
    userType: user.userType,
    details: `Thanh toán cho đơn đặt phòng đã được hoàn tất.`,
  });
}
//
