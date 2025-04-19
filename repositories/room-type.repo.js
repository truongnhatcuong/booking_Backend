import { prisma } from "../lib/client.js";

export async function createRoomTypeRepo(data) {
  return await prisma.roomType.create({
    data,
  });
}

export async function getRoomTypeRepo() {
  return await prisma.roomType.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      basePrice: true,
      maxOccupancy: true,
      photoUrls: true,
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
  });
}

export async function getRoomTypeByIdRepo(id) {
  return await prisma.roomType.findUnique({
    where: {
      id,
    },
    include: {
      amenities: true,
    },
  });
}

export async function updateRoomTypeRepo(id, data) {
  return prisma.roomType.update({
    where: { id },
    data,
  });
}

export async function deleteRoomTypeRepo(id) {
  return prisma.roomType.delete({ where: { id }, select: { id: true } });
}

export async function addAmenityRepo(roomTypeId, amenityIds) {
  return await prisma.$transaction(
    amenityIds.map((amenityId) =>
      prisma.roomTypeAmenity.create({
        data: {
          roomTypeId,
          amenityId,
        },
      })
    )
  );
}

export async function removeAmenityRepo(roomTypeId, amenityId) {
  const existing = await prisma.roomTypeAmenity.findUnique({
    where: {
      roomTypeId_amenityId: {
        roomTypeId,
        amenityId,
      },
    },
  });
  if (!existing) {
    throw new Error(
      `Amenity with ID ${amenityId} not found in room type ${roomTypeId}`
    );
  }
  return prisma.roomTypeAmenity.delete({
    where: {
      roomTypeId_amenityId: {
        roomTypeId,
        amenityId,
      },
    },
    select: { roomTypeId: true, amenityId: true },
  });
}
