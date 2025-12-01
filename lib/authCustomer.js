import jwt from "jsonwebtoken";
import { prisma } from "./client.js"; // Đảm bảo bạn có export đúng trong client.js

const JWT_SECRET = process.env.JWT_SECRET || "";

export async function authCustomer(req, res, next) {
  try {
    let token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      token = req.cookies?.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Bạn phải đăng nhập" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        customer: true,
        employee: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Tài khoản không tồn tại" });
    }

    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({ message: err });
  }
}
