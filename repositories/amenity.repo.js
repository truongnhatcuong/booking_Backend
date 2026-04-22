import { prisma } from "../lib/client.js";

export async function getAmenityRepository(page, limit) {
  const parsedPage = Number(page) || 1;
  const parsedLimit = Number(limit) || 10;

  return await prisma.$transaction([
    prisma.amenity.findMany({
      select: {
        name: true,
        description: true,
        id: true,
      },
      skip: (parsedPage - 1) * parsedLimit,
      take: parsedLimit,
    }),
    prisma.amenity.count(),
  ]);
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
