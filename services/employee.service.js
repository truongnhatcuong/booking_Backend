import {
  createEmployee,
  DeleteEmployee,
  disableRepo,
  findEmployeeByEmail,
  findEmployeeByID,
  getAllEmployeeRepo,
  updateEmployeeRepo,
  updateTokenToDb,
} from "../repositories/employee.repo.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import NotFoundError from "../errors/not-found.error.js";
import { countUsers } from "../repositories/user.repo.js";

const JWT_SECRET = process.env.JWT_SECRET || "";
export async function createEmployeeService({
  firstName,
  lastName,
  email,
  phone,
  password,
  position,
  department,
}) {
  const employee = await findEmployeeByEmail(email);
  if (employee) {
    throw new NotFoundError("Email Đã Tồn Tại Trong Hệ Thống");
  }
  const hashedPassword = bcrypt.hashSync(password, 10);

  const newEmployee = await createEmployee({
    firstName,
    lastName,
    email,
    phone,
    password: hashedPassword,
    position,
    department,
  });

  const token = jwt.sign(
    {
      id: newEmployee.id,
      userType: newEmployee.userType,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  await updateTokenToDb(newEmployee.id, token);

  return { accessToken: token, newEmployee };
}

export async function DeleteEmployeeService(id) {
  const deleteId = await findEmployeeByID(id);
  if (!deleteId) {
    throw new NotFoundError("id người dùng không đúng");
  }
  await DeleteEmployee(id);
  return { deleteId: id };
}

export async function getAllEmployeeService(search, page = 1, limit) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.max(Number(limit) || 10, 1);
  const skip = (safePage - 1) * safeLimit;

  const [result, total] = await Promise.all([
    getAllEmployeeRepo(search, skip, safeLimit),
    countUsers("EMPLOYEE", search),
  ]);
  return {
    result,
    page: safePage,
    limit: safeLimit,
    total,
    totalPages: Math.ceil(total / safeLimit),
  };
}

export async function disableService(id, action) {
  const result = await disableRepo(id, action);
  return result;
}

export async function updateEmployeeService(id, employeeData) {
  const updatedEmployee = await updateEmployeeRepo(id, employeeData);
  if (!updatedEmployee) throw NotFoundError("Không tìm thấy Employee");
  if (!updatedEmployee.user)
    throw NotFoundError("Employee chưa có User gắn kèm");
  return updatedEmployee;
}
