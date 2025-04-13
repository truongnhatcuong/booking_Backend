import { prisma } from "../lib/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userSchema, UserUpdateSchema } from "../schemas/UserSchema.js";

const JWT_SECRET = process.env.JWT_SECRET || "";

// đăng kí
export default async function signUp(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Phương thức không được hỗ trợ" });
  }

  const parsed = userSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    address,
    city,
    country,
    idNumber,
  } = parsed.data;

  const existingUser = await prisma.user.findFirst({
    where: { email },
  });
  if (existingUser) {
    return res.status(400).json({ message: "Email đã tồn tại" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
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
      },
      select: {
        customer: true,
      },
    });

    const token = jwt.sign(
      { id: newUser.id, userType: "CUSTOMER" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Nếu bạn vẫn muốn lưu token:
    await prisma.user.update({
      where: {
        id: newUser.id,
      },
      data: {
        token,
      },
    });

    return res.status(201).json({
      accessToken: token,
      message: "Tạo tài khoản thành công",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
// đăng nhập
export async function logIn(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "vui lòng điền đầy đủ thông tin !" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      res.status(400).json({ message: "người dùng không tồn tại !" });
    }
    const verifyPassword = await bcrypt.compareSync(password, user.password);
    if (!verifyPassword) {
      res.status(400).json({ message: "mật khẩu không chính xác !" });
    }
    const token = jwt.sign({ id: user.id, userType: "CUSTOMER" }, JWT_SECRET, {
      expiresIn: "1h",
    });
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        token,
      },
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000, // 1 giờ
      sameSite: "lax",
    });
    res.status(200).json({ token, message: "đăng nhập thành công !" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
// lấy người dùng
export async function getUser(req, res) {
  // req.user đã được gán từ middleware authCustomer
  return res.status(200).json({
    user: req.user,
  });
}
//cập nhật thông tin
export async function updateUser(req, res) {
  const userId = req.params.id;

  const parsed = UserUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const { firstName, lastName, phone, address, city, country, idNumber } =
    parsed.data;
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      firstName,
      lastName,
      phone,
      customer: {
        update: {
          address,
          city,
          country,
          idNumber,
        },
      },
    },
    select: { id: true },
  });
  res
    .status(200)
    .json({ message: `Update Thành Công Người Dùng id : ${user.id}` });
}
