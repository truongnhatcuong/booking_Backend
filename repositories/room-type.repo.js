import { prisma } from "../lib/client.js";

export async function createRoomTypeRepo(data) {
  return await prisma.roomType.create({
    data: {
      ...data,
      photoUrls: data.photoUrls.join(","),
    },
  });
}

export async function getRoomTypeRepo() {
  return await prisma.roomType.findMany({
    include: {
      amenities: {
        include: {
          amenity: true,
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
    data: {
      ...data,
      photoUrls: data.photoUrls ? data.photoUrls.join(",") : undefined,
    },
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
