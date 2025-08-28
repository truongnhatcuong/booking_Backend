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
} from "../repositories/user.repo.js";
import NotFoundError from "../errors/not-found.error.js";
import { sendResetMail } from "../lib/mailer.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

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

  // Nếu bạn vẫn muốn lưu token:
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
  const token = jwt.sign(
    {
      id: user.id,
      userType: user.userType,
      lastName: user.lastName,
      role,
    },
    JWT_SECRET,
    {
      expiresIn: remember === true ? "3h" : "1h",
    }
  );

  return { accessToken: token };
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
