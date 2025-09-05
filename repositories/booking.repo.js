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

export async function BookingRepo({
  customerId,
  checkInDate,
  checkOutDate,
  totalGuests,
  bookingSource,
  specialRequests,
  totalAmount,
  discountId,
  pricePerNight,
  roomId,
}) {
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
      bookingSource,
      status: "PENDING",
      discountId: discountId || null,
      bookingItems: {
        create: {
          pricePerNight,
          roomId,
        },
      },
    },
    select: {
      id: true,
      customer: {
        select: {
          user: true,
        },
      },
    },
  });
}

export async function getAllBookingRepo(
  idNumber,
  status,
  checkInDate,
  checkOutDate,
  totalAmount = "default"
) {
  const checkIn = checkInDate ? new Date(checkInDate) : null;
  const checkOut = checkOutDate ? new Date(checkOutDate) : null;
  let orderBy;
  if (totalAmount === "asc") {
    orderBy = [{ totalAmount: "asc" }, { bookingDate: "desc" }];
  } else if (totalAmount === "desc") {
    orderBy = [{ totalAmount: "desc" }, { bookingDate: "desc" }];
  } else {
    orderBy = { bookingDate: "desc" };
  }
  console.log(orderBy, "laf : ");

  return await prisma.booking.findMany({
    where: {
      customer: {
        idNumber: {
          contains: idNumber || "",
        },
      },
      status: status || {},
      ...(checkIn && !isNaN(checkIn.getTime())
        ? { checkOutDate: { gte: checkIn } }
        : {}),
      ...(checkOut && !isNaN(checkOut.getTime())
        ? { checkInDate: { lte: checkOut } }
        : {}),
    },
    select: {
      id: true,
      checkInDate: true,
      checkOutDate: true,
      status: true,
      totalAmount: true,
      totalGuests: true,
      bookingItems: {
        select: {
          room: {
            select: {
              roomType: {
                select: {
                  name: true,
                  photoUrls: true,
                },
              },
              roomNumber: true,
            },
          },
        },
      },
      customer: {
        select: {
          id: true,
          idNumber: true,
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
    orderBy,
  });
}

export async function confirmStatusRepo(id) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      bookingItems: {
        select: {
          roomId: true,
        },
      },
    },
  });
  if (!booking) throw new Error("Không tìm thấy booking");
  let nextStatus;
  let paymentStatus;

  if (booking.status === "PENDING") {
    nextStatus = "CHECKED_IN";
    paymentStatus = "COMPLETED";
    await prisma.room.update({
      where: { id: booking.bookingItems[0].roomId },
      data: {
        status: "OCCUPIED",
      },
    });
  } else if (booking.status === "CHECKED_IN") {
    nextStatus = "CHECKED_OUT";
    paymentStatus = "COMPLETED";
    await prisma.room.update({
      where: { id: booking.bookingItems[0].roomId },
      data: {
        status: "AVAILABLE",
      },
    });
  } else {
    throw new Error(
      "Trạng thái hiện tại không hợp lệ hoặc không thể chuyển trạng thái"
    );
  }

  return prisma.booking.update({
    where: {
      id,
    },
    data: {
      status: nextStatus,
      payments: {
        updateMany: {
          where: {
            bookingId: id,
          },
          data: {
            status: paymentStatus,
          },
        },
      },
    },
    include: {
      customer: {
        select: {
          user: true,
        },
      },
      payments: {
        select: {
          status: true,
        },
      },
    },
  });
}

export async function CancelledBookingRepo(id) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    select: {
      bookingItems: {
        select: {
          roomId: true,
        },
      },
    },
  });

  if (!booking) throw new Error("Booking not found");

  await prisma.room.update({
    where: { id: booking.bookingItems[0].roomId },
    data: {
      status: "AVAILABLE",
    },
  });

  return prisma.booking.update({
    where: {
      id,
    },
    data: {
      status: "CANCELLED",
      payments: {
        updateMany: {
          where: {
            bookingId: id,
          },
          data: {
            status: "REFUNDED",
          },
        },
      },
    },
    include: {
      customer: {
        select: { user: true },
      },
    },
  });
}

export async function getBookingForUserRepo(id) {
  return await prisma.booking.findMany({
    where: { customerId: id },
    select: {
      id: true,
      bookingDate: true,
      checkInDate: true,
      checkOutDate: true,
      totalGuests: true,
      status: true,
      bookingSource: true,
      totalAmount: true,
      customerId: true,

      bookingItems: {
        select: {
          pricePerNight: true,
          room: {
            select: {
              roomNumber: true,
              floor: true,
              roomType: {
                select: {
                  name: true,
                  amenities: {
                    select: {
                      amenity: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
              images: true,
            },
          },
        },
      },
      payments: {
        select: {
          paymentDate: true,
          amount: true,
          paymentMethod: true,
          status: true,
        },
      },
      discount: true,
    },
    orderBy: {
      bookingDate: "desc",
    },
  });
}

export async function removeBookingUserRepo(id) {
  await prisma.bookingItem.deleteMany({
    where: {
      bookingId: id,
    },
  });
  await prisma.payment.deleteMany({
    where: {
      bookingId: id,
    },
  });
  return prisma.booking.delete({
    where: {
      id,
    },
    include: {
      customer: {
        select: {
          user: true,
        },
      },
    },
  });
}
