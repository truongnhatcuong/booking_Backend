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

export async function getAllRoomRepo() {
  return prisma.room.findMany({
    select: {
      id: true,
      roomNumber: true,
      floor: true,
      status: true,
      notes: true,
      roomTypeId: true,
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
        },
      },
    },
  });
}

export async function deletedRoomRepo(id) {
  return prisma.room.delete({
    where: {
      id: id,
    },
  });
}

export async function updateRoomRepo(id, data) {
  return prisma.room.update({
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
export async function getRoomCustomerRepo() {
  return prisma.room.findMany({
    where: {
      status: "AVAILABLE",
    },
    select: {
      id: true,
      roomNumber: true,
      roomTypeId: true,
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
        in: ["PENDING", "CONFIRMED"],
      },
    },
    select: {
      checkInDate: true,
      checkOutDate: true,
    },
  });
}
