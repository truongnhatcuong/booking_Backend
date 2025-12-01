import { prisma } from "../lib/client.js";

// Lấy phòng trống từ DB
export async function getRoom() {
  const rooms = await prisma.room.findMany({
    where: {
      status: "AVAILABLE",
    },

    select: {
      id: true,
      roomNumber: true,
      images: true,
      status: true,
      originalPrice: true,
      roomType: {
        select: {
          id: true,
          maxOccupancy: true,
          description: true,
          name: true,
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

  return rooms;
}

export async function getRoomType() {
  const roomTypes = await prisma.roomType.findMany();
  return roomTypes.map((rt) => {
    const roomtypelink = `${process.env.FRONTEND_URL}/rooms/${rt.id}`;
    return `Loại Phòng: ${rt.name}
Mô tả: ${rt.description || "Không có mô tả"}
[Xem chi tiết loại phòng](${roomtypelink})`;
  });
}

export async function checkRoomAVAILABLE() {
  const rooms = await prisma.room.findMany({
    where: {
      status: "AVAILABLE",
    },
  });

  return {
    count: rooms.length,
  };
}
