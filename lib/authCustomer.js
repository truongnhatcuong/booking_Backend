import jwt from "jsonwebtoken";
import { prisma } from "./client.js"; // Đảm bảo bạn có export đúng trong client.js

const JWT_SECRET = process.env.JWT_SECRET || "";

export async function authCustomer(req, res, next) {
  try {
    const token = req.cookies?.token;
    console.log("Token:", token); // Debugging line to check the token value

    if (!token) {
      return res.status(401).json({ message: "Trước Tiên Bạn Phải Đăng Nhập" });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        customer: true,
        employee: true,
      },
    });

    if (!user) return null;

    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({ message: err });
  }
}
