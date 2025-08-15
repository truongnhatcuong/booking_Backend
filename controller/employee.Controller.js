import { hasUserPermission } from "../lib/hasUserPermission.js";
import { employeeSchema } from "../schemas/EmployeeSchema.js";
import {
  createEmployeeService,
  DeleteEmployeeService,
  disableService,
  getAllEmployeeService,
  updateEmployeeService,
} from "../services/employee.service.js";

export default async function employeeRegister(req, res) {
  const parsed = employeeSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  try {
    const { accessToken } = await createEmployeeService(parsed.data);
    return res.status(201).json({ accessToken, message: "tao thanh cong" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function DeleteEmployeeCotroller(req, res) {
  const { id } = req.params;

  try {
    const result = await DeleteEmployeeService(id);

    res.status(200).json({
      message: `id : ${result} của nhân viên nãy đã được xóa`,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getAllEmployee(req, res) {
  const { search, page, limit } = req.query;
  try {
    const employee = await getAllEmployeeService(search, page, limit);
    return res.status(200).json({ employee, message: "thành công" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function disableUser(req, res) {
  const { action } = req.body;
  const { id } = req.params;
  if (!hasUserPermission(req.user, "USER_UPDATE")) {
    return res
      .status(403)
      .json({ message: "Bạn không có quyền cập nhật trạng thái người dùng" });
  }

  try {
    const result = await disableService(id, action);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" + error });
  }
}

export async function updateEmployee(req, res) {
  const { id } = req.params;
  const { firstName, lastName, phone, department, position } = req.body;
  if (!hasUserPermission(req.user, "USER_UPDATE")) {
    return res
      .status(403)
      .json({ message: "Bạn không có quyền cập nhật thông tin nhân viên" });
  }

  try {
    const updatedEmployee = await updateEmployeeService(id, {
      firstName,
      lastName,
      phone,
      department,
      position,
    });
    return res
      .status(200)
      .json({ updatedEmployee, message: "Cập nhật thành công" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
