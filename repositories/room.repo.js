import { prisma } from "../lib/client.js";

export async function createRoomRepo(data) {
  return prisma.room.create({
    data,
  });
}

export async function getAllRoomRepo() {
  return prisma.room.findMany({
    include: {
      roomType: {
        select: {
          name: true,
          basePrice: true,
          maxOccupancy: true,
          amenities: true,
        },
      },
    },
  });
}
