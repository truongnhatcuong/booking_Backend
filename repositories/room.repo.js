import { prisma } from "../lib/client.js";

export async function createRoomRepo(data) {
  return prisma.room.create({
    data: {
      roomNumber: data.roomNumber,
      floor: data.floor,
      status: data.status,
      notes: data.notes || null,
      roomTypeId: data.roomTypeId,
      images: data.imageUrls
        ? {
            create: data.imageUrls.map((url) => ({
              imageUrl: url,
            })),
          }
        : null,
    },
  });
}

export async function getAllRoomRepo(
  checkIn,
  checkOut,
  customer,
  status,
  roomType,
  search,
  skip,
  take
) {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const where = {
    ...(status && { status }),
    // ROOM TYPE
    ...(roomType && roomType.length > 0
      ? {
          roomType: {
            name: { in: roomType }, // LUÔN dùng in: []

            ...(customer && {
              maxOccupancy: { gte: Number(customer) },
            }),
          },
        }
      : customer
        ? {
            roomType: {
              maxOccupancy: { gte: Number(customer) },
            },
          }
        : {}),
    // SEARCH
    ...(search && {
      roomNumber: {
        contains: search || "",
      },
    }),

    // DATE RANGE
    ...(checkIn &&
      checkOut &&
      !isNaN(checkInDate.getTime()) &&
      !isNaN(checkOutDate.getTime()) && {
        bookingItems: {
          none: {
            booking: {
              AND: [
                { checkInDate: { lt: checkOutDate } },
                { checkOutDate: { gt: checkInDate } },
              ],
            },
          },
        },
      }),
  };

  // song song lấy danh sách và tổng số phòng
  const [rooms, total] = await Promise.all([
    prisma.room.findMany({
      where,
      skip: Number(skip),
      take: Number(take),
      select: {
        id: true,
        roomNumber: true,
        floor: true,
        status: true,
        notes: true,
        roomTypeId: true,
        bookingItems: {
          select: {
            booking: {
              select: {
                checkInDate: true,
                checkOutDate: true,
              },
            },
          },
          orderBy: { booking: { bookingDate: "desc" } },
        },
        images: {
          select: {
            id: true,
            imageUrl: true,
          },
        },
        roomType: {
          select: {
            id: true,
            name: true,
            maxOccupancy: true,
            basePrice: true,
          },
        },
      },
    }),
    prisma.room.count(),
  ]);

  return {
    data: rooms,
    total,
  };
}

export async function deletedRoomRepo(id) {
  return prisma.room.delete({
    where: {
      id: id,
    },
  });
}

export async function findRoomNumber(roomNumber) {
  return await prisma.room.findUnique({
    where: {
      roomNumber,
    },
    select: {
      id: true,
      roomNumber: true,
    },
  });
}
export async function updateRoomRepo(id, data) {
  return await prisma.room.update({
    where: {
      id: id,
    },
    data: {
      roomNumber: data.roomNumber,
      floor: data.floor,
      status: data.status,
      notes: data.notes || null,
      roomTypeId: data.roomTypeId,
    },
  });
}

export async function deleteImageToRoomRepo(id) {
  return prisma.roomImage.delete({
    where: {
      id,
    },
  });
}

export async function addImageToRoomRepo(data) {
  const { roomId, imageUrls } = data;
  return prisma.roomImage.createMany({
    data: imageUrls.map((url) => ({
      roomId,
      imageUrl: url,
    })),
  });
}

// dành cho khách hàng
export async function getRoomCustomerRepo(
  checkIn,
  checkOut,
  customer,
  roomType
) {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const where = {
    // ROOM TYPE
    ...(roomType || customer
      ? {
          roomType: {
            ...(roomType && { name: roomType }),
            ...(customer && {
              maxOccupancy: { gte: Number(customer) },
            }),
          },
        }
      : {}),

    // DATE RANGE
    ...(checkIn &&
      checkOut &&
      !isNaN(checkInDate.getTime()) &&
      !isNaN(checkOutDate.getTime()) && {
        bookingItems: {
          none: {
            booking: {
              AND: [
                { checkInDate: { lt: checkOutDate } },
                { checkOutDate: { gt: checkInDate } },
              ],
            },
          },
        },
      }),
  };
  return prisma.room.findMany({
    where,
    select: {
      id: true,
      roomNumber: true,
      roomTypeId: true,
      status: true,
      images: {
        select: {
          id: true,
          imageUrl: true,
        },
      },
      roomType: {
        select: {
          name: true,
          maxOccupancy: true,
          basePrice: true,
          amenities: {
            select: {
              amenity: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });
}
// hiển thị danh sách phòng theo loại phòng
export async function getRoomsByRoomTypeIdRepo(id) {
  return await prisma.roomType.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      maxOccupancy: true,
      basePrice: true,
      rooms: {
        select: {
          id: true,
          roomNumber: true,
          images: {
            select: {
              id: true,
              imageUrl: true,
            },
          },
        },
      },
      amenities: {
        select: {
          amenity: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
}

// hiển thị id của từng loại phòng

export async function getRoomIdRepo(id) {
  return await prisma.room.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      roomNumber: true,
      floor: true,
      status: true,
      notes: true,
      images: true,
      roomType: {
        include: {
          amenities: {
            select: {
              amenity: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function findBookedDateRangesRepo(roomId) {
  return await prisma.booking.findMany({
    where: {
      bookingItems: {
        some: {
          roomId: roomId,
        },
      },
      status: {
        in: ["PENDING", "CHECKED_IN", "CHECKED_OUT"],
      },
    },
    select: {
      checkInDate: true,
      checkOutDate: true,
      status: true,
    },
  });
}
