import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  changePasswordRepo,
  countUsers,
  createCustomerRepo,
  createUser,
  disableUserRepo,
  findIDNumber,
  findUserByEmail,
  getAllCustomerRepo,
  getUserToken,
  updateUserId,
  updateUserPassword,
  updateUserToken,
  createGuestRepo,
  findIDNumberGuest,
} from "../repositories/user.repo.js";
import NotFoundError from "../errors/not-found.error.js";
import { sendResetMail } from "../lib/mailer.js";
import { prisma } from "../lib/client.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "refresh-secret-key";

export default async function signUp({
  firstName,
  lastName,
  email,
  phone,
  password,
  address,
  city,
  country,
  idNumber,
}) {
  const existingUser = await findUserByEmail(email);
  const existIdNumber = await findIDNumber(idNumber);

  if (existingUser) {
    throw new Error("Email đã tồn tại");
  }
  if (existIdNumber) {
    throw new Error("CCCD đã tồn tại trong hệ thống");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await createUser({
    firstName,
    lastName,
    email,
    phone,
    password: hashedPassword,
    userType: "CUSTOMER",
    status: "ACTIVE",
    customer: {
      create: {
        address,
        city,
        country,
        idNumber,
      },
    },
  });

  const token = jwt.sign(
    { id: newUser.id, userType: newUser.userType },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  await updateUserToken(newUser.id, token);

  return { accessToken: token, user: newUser };
}

export async function login({ email, password, remember }) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new NotFoundError("Người dùng không tồn tại");
  }

  if (user.status !== "ACTIVE") {
    throw new NotFoundError("Tài Khoản Đã Bị Hạn Chế Vui Lòng Liên Hệ ADMIN");
  }

  const verifyPassword = await bcrypt.compareSync(password, user.password);
  if (!verifyPassword) {
    throw new NotFoundError("Mật khẩu không chính xác");
  }

  let role = null;
  if (user.userType === "EMPLOYEE" && user.employee) {
    role = user.employee.roles[0]?.role?.name || "";
  }

  const payload = {
    id: user.id,
    userType: user.userType,
    lastName: user.lastName,
    role,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: remember ? "20m" : "15m",
  });

  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken: token, refreshToken };
}

export async function refreshTokenService(refreshToken) {
  if (!refreshToken) throw new NotFoundError("Thiếu refresh token");

  const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

  const payload = {
    id: decoded.id,
    userType: decoded.userType,
    lastName: decoded.lastName,
    role: decoded.role,
  };
  const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
  return newAccessToken;
}

export async function updateUser(
  userId,
  { firstName, lastName, phone, address, city, country, idNumber }
) {
  const updatedUser = await updateUserId(userId, {
    firstName,
    lastName,
    phone,
    address,
    city,
    country,
    idNumber,
  });

  return { updatedUser };
}

export async function getUser(userId) {
  const user = await getUserToken(userId);
  if (!user) {
    throw new NotFoundError("Không tìm thấy người dùng");
  }
  return user;
}

export async function getAllCustomerService(search, page = 1, limit) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.max(Number(limit) || 10, 1);
  const skip = (safePage - 1) * safeLimit;

  const [result, total] = await Promise.all([
    getAllCustomerRepo(search, skip, safeLimit),
    countUsers("CUSTOMER", search),
  ]);
  return {
    result,
    page: safePage,
    limit: safeLimit,
    total,
    totalPages: Math.ceil(total / safeLimit),
  };
}

export async function createCustomerService({
  firstName,
  lastName,
  email,
  phone,
  idNumber,
  city,
  address,
}) {
  const customernew = await createCustomerRepo({
    firstName,
    lastName,
    email,
    phone,
    idNumber,
    city,
    address,
  });
  return customernew;
}

export async function changePasswordService(
  userId,
  currentPassword,
  newPassword
) {
  const user = await getUserToken(userId);
  if (!user) throw new Error("Người dùng không tồn tại");
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new NotFoundError("Mật Khẩu Không Chính Xác !");
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const result = await changePasswordRepo(userId, hashedPassword);
  return result;
}

export async function forgotPasswordService(email) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("Người dùng không tồn tại");
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "15m" });
  const resetMail = `${process.env.FRONTEND_URL}/forgot-password/reset-password?token=${token}`;
  await sendResetMail(email, resetMail);
}

export const resetPasswordService = async (token, password) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const hashed = await bcrypt.hash(password, 10);
    await updateUserPassword(decoded.id, hashed);
  } catch (err) {
    throw new Error("Invalid or expired token", err);
  }
};

export async function disableUserService(userId) {
  const user = await getUserToken(userId);
  if (!user) throw new NotFoundError("Người dùng không tồn tại");

  const updatedUser = await disableUserRepo(userId);
  return updatedUser;
}

export async function createGuestService(data) {
  const existIdNumber = await findIDNumber(data.idNumber);
  if (existIdNumber) {
    throw new Error("CCCD đã tồn tại trong hệ thống");
  }
  const existGuest = await findIDNumberGuest(data.idNumber);

  if (existGuest) {
    // Kiểm tra xem guest này có booking trong thời gian sắp tới không
    const activeBooking = await prisma.booking.findFirst({
      where: {
        guestId: existGuest.id,
        checkOutDate: { gte: new Date(data.checkInDate) },
        checkInDate: { lte: new Date(data.checkOutDate) },
        status: { in: ["CONFIRMED", "PENDING", "CHECKED_IN"] },
      },
      include: {
        bookingItems: { include: { room: true } },
      },
    });
    if (activeBooking) {
      throw new Error(
        `Người này đã có đặt phòng ${activeBooking.bookingItems[0].room.roomNumber} từ ${new Date(
          activeBooking.checkInDate
        ).toLocaleDateString("vi-VN")} đến ${new Date(
          activeBooking.checkOutDate
        ).toLocaleDateString("vi-VN")}. Vui lòng chọn thời gian khác.`
      );
    }
  }

  const result = await createGuestRepo(data);
  return result;
}
