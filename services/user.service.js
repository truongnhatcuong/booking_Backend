import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  createUser,
  findUserByEmail,
  getUserToken,
  updateUserId,
  updateUserToken,
} from "../repositories/user.repo.js";

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

export async function login({ email, password,remember }) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("Người dùng không tồn tại");
  }

  const verifyPassword = await bcrypt.compareSync(password, user.password);
  if (!verifyPassword) {
    throw new Error("Mật Khẩu Không Chính Xác");
  }
  const expiresIn = remember ? '1d' : '1h';
  

  const token = jwt.sign({ id: user.id, userType: user.userType }, JWT_SECRET, {
    expiresIn
  });

  console.log(expiresIn);
  
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
    throw new Error("Không tìm thấy người dùng");
  }
  return user;
}
