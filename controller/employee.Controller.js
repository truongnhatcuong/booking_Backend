import { employeeSchema } from "../schemas/EmployeeSchema.js";
import {
  createEmployeeService,
  DeleteEmployeeService,
  disableService,
  getAllEmployeeService,
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
  console.log(id);

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
  try {
    const employee = await getAllEmployeeService();
    return res.status(200).json({ employee, message: "thành công" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function disableUser(req, res) {
  const { action } = req.body;
  const { id } = req.params;

  try {
    const result = await disableService(id, action);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" + error });
  }
}
