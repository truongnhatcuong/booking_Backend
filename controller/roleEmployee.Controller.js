import { hasUserPermission } from "../lib/hasUserPermission.js";
import {
  CreateRoleEmployeeService,
  GetRoleEmployeeService,
  RemoveEmployeeRoleService,
  RoleEmployeeService,
} from "../services/roleEmployee.service.js";

export async function CreateRoleEmployee(req, res) {
  const { name, permissions } = req.body;

  if (!name || !permissions) {
    return res
      .status(400)
      .json({ message: "Name and permissions are required" });
  }

  try {
    const role = await CreateRoleEmployeeService({ name, permissions });
    return res.status(201).json({
      role,
      message: "Role created successfully",
    });
  } catch (error) {
    console.error("Error creating role:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function GetRoleEmployee(req, res) {
  try {
    const roles = await GetRoleEmployeeService(req.body);
    return res.status(200).json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function RoleEmployee(req, res) {
  const { idEmployee, idRole } = req.body;
  try {
    if (!hasUserPermission(req.user, "ROLE_MANAGE")) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền tạo vai trò cho nhân viên" });
    }
    if (!idEmployee || !idRole) {
      return res.status(400).json({ message: "Thiếu idEmployee hoặc idRole" });
    }

    const roleEmployee = await RoleEmployeeService(idEmployee, idRole);
    return res.status(200).json(roleEmployee);
  } catch (error) {
    console.error("Error fetching roles:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function RemoveEmployeeRole(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Thiếu id" });
  }
  if (!hasUserPermission(req.user, "USER_UPDATE")) {
    return res
      .status(403)
      .json({ message: "Bạn không có quyền hủy vai trò của nhân viên" });
  }

  try {
    const result = await RemoveEmployeeRoleService(id);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error removing employee role:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
