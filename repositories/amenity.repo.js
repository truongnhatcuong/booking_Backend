import { prisma } from "../lib/client.js";

export async function getAmenityRepository() {
  return await prisma.amenity.findMany({
    select: {
      name: true,
      description: true,
      id: true,
    },
  });
}

export async function createAmenityRepo(data) {
  return await prisma.amenity.create({
    data,
  });
}

export async function deletedAmenityRepo(id) {
  return prisma.amenity.delete({
    where: {
      id,
    },
    select: { id: true },
  });
}

export async function UpdateAmenityRepo(id, data) {
  return await prisma.amenity.update({
    where: {
      id,
    },
    data,
  });
}
