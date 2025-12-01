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

export async function getAllEmployeeRepo(search, skip, take) {
  return await prisma.user.findMany({
    where: {
      AND: [
        { userType: "EMPLOYEE" },
        {
          OR: [
            { firstName: { contains: search || "" } },
            { lastName: { contains: search || "" } },
          ],
        },
      ],
    },
    skip: Number(skip),
    take: Number(take),
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

export async function updateEmployeeRepo(id, employeeData) {
  return await prisma.employee.update({
    where: {
      id,
    },
    include: {
      user: true,
    },  
    data: {
      user: {
        update: {
          firstName: employeeData.firstName,
          lastName: employeeData.lastName,
          phone: employeeData.phone,
        },
      },
    },
  });
}
