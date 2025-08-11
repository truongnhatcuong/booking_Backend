import jwt from "jsonwebtoken";
import { prisma } from "./client.js"; // Đảm bảo bạn có export đúng trong client.js
export async function authEmployee(req, res, next) {
  const JWT_SECRET = process.env.JWT_SECRET || "";
  if (!JWT_SECRET) {
    return res.status(500).json({ message: "Server error" });
  }
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Bạn phải đăng nhập" });
  }

  const decoded = jwt.verify(token, JWT_SECRET);

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    include: {
      employee: {
        include: {
          roles: {
            select: {
              role: {
                select: {
                  name: true,
                  permissions: true,
                },
              },
            },
          },
        },
      },
    },
  });
  if (!user) return null;

  req.user = user;
  if (
    !user ||
    (decoded.userType !== "ADMIN" && decoded.userType !== "EMPLOYEE")
  ) {
    return res.status(403).json("Bạn Không có quyền truy cập");
  }

  next();
}
