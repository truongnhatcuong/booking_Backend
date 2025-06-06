import {
  CreateRoleEmployeeService,
  GetRoleEmployeeService,
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
