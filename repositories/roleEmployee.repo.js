import { prisma } from "../lib/client.js";
export async function CreateRoleEmployeeRepo(data) {
  const { name, permissions } = data;
  return await prisma.role.create({
    data: {
      name,
      permissions,
    },
  });
}
export async function GetRoleEmployeeRepo() {
  return await prisma.role.findMany();
}
export async function UpdateRoleEmployeeRepo(id, data) {
  const { name, permissions } = data;
  return await prisma.role.update({
    where: { id },
    data: {
      name,
      permissions,
    },
  });
}
export async function DeleteRoleEmployeeRepo(id) {
  return await prisma.role.delete({
    where: { id },
  });
}

export async function RoleEmployeeRepo(idEmployee, idRole) {
  return await prisma.employeeRole.create({
    data: {
      employeeId: idEmployee,
      roleId: idRole,
    },
  });
}

export async function RemoveEmployeeRoleRepo(id) {
  return await prisma.employeeRole.delete({
    where: { id },
  });
}
