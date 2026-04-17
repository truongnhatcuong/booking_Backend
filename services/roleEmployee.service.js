import NotFoundError from "../errors/not-found.error.js";
import {
  CreateRoleEmployeeRepo,
  FindRole,
  GetRoleEmployeeRepo,
  RemoveEmployeeRoleByRoleIdRepo,
  RemoveEmployeeRoleRepo,
  RemoveRoleRepo,
  RoleEmployeeRepo,
} from "../repositories/roleEmployee.repo.js";

export async function CreateRoleEmployeeService(data) {
  const { name, permissions } = data;
  if (!name || !permissions) {
    throw new NotFoundError("Name and permissions are required");
  }
  const role = await CreateRoleEmployeeRepo({ name, permissions });

  return role;
}

export async function GetRoleEmployeeService() {
  const roles = await GetRoleEmployeeRepo();

  return roles;
}

export async function UpdateRoleEmployeeService(id, data) {
  const { name, permissions } = data;
  if (!id || !name || !permissions) {
    throw new NotFoundError("ID, name, and permissions are required");
  }
  const updatedRole = await CreateRoleEmployeeRepo(id, { name, permissions });
  if (!updatedRole) {
    throw new NotFoundError("Role not found");
  }
  return updatedRole;
}

export async function RoleEmployeeService(idEmployee, idRole) {
  const result = await RoleEmployeeRepo(idEmployee, idRole);
  return result;
}

export async function RemoveRoleService(id) {
  // 1. Kiểm tra role tồn tại
  const role = await FindRole(id);
  if (!role) throw new Error("Vai trò không tồn tại");

  // 2. Xóa employeeRole trước (tránh lỗi foreign key)
  await RemoveEmployeeRoleByRoleIdRepo(id);

  // 3. Xóa role
  const result = await RemoveRoleRepo(id);
  return result;
}

export async function DeleteRoleEmployeeService(id) {
  if (!id) {
    throw new NotFoundError("ID is required");
  }
  const deletedRole = await RemoveEmployeeRoleRepo(id);
  if (!deletedRole) {
    throw new NotFoundError("Role not found");
  }
}
