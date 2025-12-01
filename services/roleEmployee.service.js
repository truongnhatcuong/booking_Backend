import NotFoundError from "../errors/not-found.error.js";
import {
  CreateRoleEmployeeRepo,
  GetRoleEmployeeRepo,
  RemoveEmployeeRoleRepo,
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
export async function DeleteRoleEmployeeService(id) {
  if (!id) {
    throw new NotFoundError("ID is required");
  }
  const deletedRole = await CreateRoleEmployeeRepo(id);
  if (!deletedRole) {
    throw new NotFoundError("Role not found");
  }
  return deletedRole;
}

export async function RoleEmployeeService(idEmployee, idRole) {
  const result = await RoleEmployeeRepo(idEmployee, idRole);
  return result;
}

export async function RemoveEmployeeRoleService(id) {
  const result = await RemoveEmployeeRoleRepo(id);
  return result;
}
