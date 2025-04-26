import { prisma } from "../lib/client.js";

export async function checkStatusBooking(id) {
  return await prisma.room.findUnique({
    where: {
      id: id,
    },
    select: {
      status: true,
    },
  });
}
export async function BookingRepo(data) {
  const {
    customerId,
    checkInDate,
    checkOutDate,
    totalGuests,
    specialRequests,
    totalAmount,
    discountId,
    pricePerNight,
    roomId,
  } = data;

  return await prisma.booking.create({
    data: {
      bookingDate: new Date(),
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      customerId,
      totalAmount,
      totalGuests,
      specialRequests: specialRequests || null,
      bookingSource: "WEBSITE",
      status: "PENDING",
      discountId: discountId || null,
      bookingItems: {
        create: {
          pricePerNight,
          roomId,
        },
      },
    },
  });
}

export async function payMentBookingRepo(data) {
  return await prisma.payment.create({
    data: {
      paymentDate: new Date(),
      amount: data.totalAmount,
      paymentMethod: data.paymentMethod,
      status: "PENDING",
      bookingId: data.bookingId,
    },
  });
}
