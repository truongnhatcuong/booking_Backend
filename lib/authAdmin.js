import jwt from "jsonwebtoken";
import { prisma } from "./client.js";

const JWT_SECRET = process.env.JWT_SECRET || "";

export async function authAdmin(req, res, next) {
  if (!JWT_SECRET) {
    return res.status(403).json("vui lòng cung cấp mã mật");
  }
  try {
    let token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      token = req.cookies?.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Bạn phải đăng nhập" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });
    if (!user || decoded.userType !== "ADMIN") {
      return res.status(403).json("Bạn Không có quyền truy cập");
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
