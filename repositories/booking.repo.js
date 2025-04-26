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

  const validCheckInDate = new Date(checkInDate);
  const validCheckOutDate = new Date(checkOutDate);

  return await prisma.booking.create({
    data: {
      bookingDate: new Date(),
      checkInDate: validCheckInDate,
      checkOutDate: validCheckOutDate,
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

export async function getAllBookingRepo() {
  return await prisma.booking.findMany({
    select: {
      id: true,
      checkInDate: true,
      checkOutDate: true,
      status: true,
      totalAmount: true,
      totalGuests: true,

      customer: {
        select: {
          id: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      payments: {
        select: {
          id: true,
          status: true,
          paymentMethod: true,
        },
      },
    },
  });
}
