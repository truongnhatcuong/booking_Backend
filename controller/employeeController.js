import jwt from "jsonwebtoken";
import { prisma } from "../lib/client.js";
import { employeeSchema } from "../schemas/EmployeeSchema.js";
import bcrypt from "bcrypt";

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

const JWT_SECRET = process.env.JWT_SECRET || "";
export default async function employeeRegister(req, res) {
  const parsed = employeeSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const { firstName, lastName, email, phone, password, position, department } =
    parsed.data;
  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const existEmployee = await prisma.user.findMany({
      where: { email },
    });

    if (existEmployee) {
      return res
        .status(400)

        .json({ message: "email này đã tồn tại trong hệ thống !" });
    }
    const newEmployee = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        userType: "EMPLOYEE",
        phone,
        password: hashedPassword,
        employee: {
          create: {
            position,
            department,
            hireDate: new Date(),
          },
        },
      },
    });
    const token = jwt.sign(
      { id: newEmployee.id, userType: "EMPLOYEE" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    await prisma.user.update({
      where: {
        id: newEmployee.id,
      },
      data: { token },
    });
    return res.status(201).json({ token, message: "tao thanh cong" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
