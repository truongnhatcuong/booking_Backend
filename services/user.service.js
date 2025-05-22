import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  changePasswordRepo,
  createCustomerRepo,
  createUser,
  findUserByEmail,
  getAllCustomerRepo,
  getUserToken,
  updateUserId,
  updateUserToken,
} from "../repositories/user.repo.js";
import NotFoundError from "../errors/not-found.error.js";

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
  if (existingUser) {
    throw new Error("Email đã tồn tại");
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
    throw new NotFoundError("Mật Khẩu Không Chính Xác");
  }
  const expiresIn = remember ? "1d" : "1h";

  const token = jwt.sign({ id: user.id, userType: user.userType }, JWT_SECRET, {
    expiresIn,
  });

  return { accessToken: token, user };
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

export async function getAllCustomerService(isNumber) {
  const result = await getAllCustomerRepo(isNumber);
  return result;
}

export async function createCustomerService({
  firstName,
  lastName,
  email,
  phone,
  idNumber,
}) {
  const customernew = await createCustomerRepo({
    firstName,
    lastName,
    email,
    phone,
    idNumber,
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
