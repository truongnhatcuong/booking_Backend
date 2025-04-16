import {
  createEmployee,
  DeleteEmployee,
  findEmployeeByEmail,
  findEmployeeByID,
  updateTokenToDb,
} from "../repositories/employee.repo.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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
    throw new Error("Email Đã Tồn Tại Trong Hệ Thống");
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
    throw new Error("id người dùng không đúng");
  }
  await DeleteEmployee(id);
  return { deleteId: id };
}
