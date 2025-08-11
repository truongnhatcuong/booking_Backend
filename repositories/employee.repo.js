import { prisma } from "../lib/client.js";

export async function findEmployeeByEmail(email) {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export async function createEmployee(EmployeeData) {
  return await prisma.user.create({
    data: {
      email: EmployeeData.email,
      firstName: EmployeeData.firstName,
      lastName: EmployeeData.lastName,
      phone: EmployeeData.phone,
      userType: "EMPLOYEE",
      password: EmployeeData.password,
      employee: {
        create: {
          department: EmployeeData.department,
          position: EmployeeData.position,
          hireDate: new Date(),
        },
      },
    },
  });
}

export async function updateTokenToDb(id, token) {
  return await prisma.user.update({
    where: {
      id,
    },
    data: {
      token,
    },
  });
}

export async function DeleteEmployee(id) {
  return await prisma.user.delete({
    where: {
      id: id,
    },
    select: { id: true },
  });
}

export async function findEmployeeByID(id) {
  return await prisma.user.findUnique({
    where: {
      id,
    },
    select: { id: true },
  });
}

export async function getAllEmployeeRepo() {
  return await prisma.user.findMany({
    where: {
      userType: "EMPLOYEE",
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      userType: true,
      status: true,
      employee: {
        select: {
          id: true,
          department: true,
          hireDate: true,
          position: true,
          roles: {
            take: 1,
            select: {
              id: true,
              role: {
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

export async function disableRepo(id, action) {
  return await prisma.user.update({
    where: {
      id,
    },
    data: {
      status: action,
    },
  });
}
