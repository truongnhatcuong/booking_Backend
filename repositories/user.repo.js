import { prisma } from "../lib/client.js";

export async function findUserByEmail(email) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

export async function createUser(userData) {
  return await prisma.user.create({
    data: userData,
  });
}

export async function updateUserToken(userId, token) {
  return await prisma.user.update({
    where: { id: userId },
    data: { token },
  });
}

export async function updateUserId(userId, userData) {
  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      customer: {
        update: {
          address: userData.address,
          city: userData.city,
          country: userData.country,
          idNumber: userData.idNumber,
        },
      },
    },
  });
}

export async function getUserToken(userId) {
  return await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      customer: true, // hoặc employee nếu cần
      employee: true,
    },
  });
}
