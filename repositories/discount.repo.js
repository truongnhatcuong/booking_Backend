import { prisma } from "../lib/client.js";
export async function createDisCoutRepo(data) {
  const { code, percentage, validFrom, validTo } = data;
  const DateStart = new Date(validFrom);
  const DateEnd = new Date(validTo);
  return await prisma.discount.create({
    data: {
      code,
      percentage,
      validFrom: DateStart,
      validTo: DateEnd,
    },
  });
}

export async function updateDisCoutRepo(id, data) {
  const { code, percentage, validFrom, validTo } = data;
  const DateStart = new Date(validFrom);
  const DateEnd = new Date(validTo);
  return await prisma.discount.update({
    where: {
      id,
    },
    data: {
      code,
      percentage,
      validFrom: DateStart,
      validTo: DateEnd,
    },
  });
}

export async function getDisCountCodeRepo(code) {
  return prisma.discount.findUnique({
    where: {
      code,
    },
  });
}

export async function getAllDisCodeRepo() {
  return prisma.discount.findMany({});
}

export async function DeleteDisCountRepo(id) {
  return prisma.discount.delete({
    where: {
      id,
    },
  });
}
