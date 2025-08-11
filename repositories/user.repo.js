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

export async function getAllCustomerRepo(searchName, idNumber) {
  return await prisma.user.findMany({
    where: {
      userType: "CUSTOMER",
      AND: [
        {
          OR: [
            {
              firstName: {
                contains: searchName || "",
              },
            },
            {
              lastName: {
                contains: searchName || "",
              },
            },
            {
              customer: {
                idNumber: {
                  contains: idNumber || "",
                },
              },
            },
          ],
        },
      ],
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      userType: true,
      status: true,
      customer: {
        select: {
          id: true,
          address: true,
          city: true,
          country: true,
          idNumber: true,
        },
      },
    },
  });
}

export async function createCustomerRepo(data) {
  const { firstName, lastName, email, phone, idNumber } = data;
  return prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      userType: "CUSTOMER",
      phone,
      customer: {
        create: {
          idNumber,
        },
      },
    },
  });
}

export async function changePasswordRepo(id, hashedPassword) {
  return prisma.user.update({
    where: {
      id,
    },
    data: {
      password: hashedPassword,
    },
  });
}

export async function findUserById(userId) {
  return await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
}

export async function updateUserPassword(id, hashedPassword) {
  return await prisma.user.update({
    where: {
      id,
    },
    data: {
      password: hashedPassword,
    },
  });
}

export async function disableUserRepo(userId) {
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { status: true },
  });
  const newStatus = currentUser.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status: newStatus,
    },
  });
}
