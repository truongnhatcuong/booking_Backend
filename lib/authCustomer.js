import jwt from "jsonwebtoken";
import { prisma } from "./client.js"; // Đảm bảo bạn có export đúng trong client.js

const JWT_SECRET = process.env.JWT_SECRET || "";

export async function authCustomer(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        customer: true,
        employee: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch (err) {
    console.error("auth error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
