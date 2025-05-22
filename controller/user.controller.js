import {
  userSchema,
  UserUpdateSchema,
  CreateCustomer,
  changePasswordSchema,
} from "../schemas/UserSchema.js";
import signUp, {
  changePasswordService,
  createCustomerService,
  getAllCustomerService,
  getUser,
  login,
  updateUser,
} from "../services/user.service.js";

// đăng kí
export default async function signUpController(req, res) {
  const parsed = userSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  try {
    const { accessToken } = await signUp(parsed.data);

    return res.status(201).json({
      accessToken,
      message: "Tạo tài khoản thành công",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
// đăng nhập
export async function loginController(req, res) {
  try {
    const { email, password, remember } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin!" });
    }
    const { accessToken } = await login({ email, password, remember });

    const maxAgeChange =
      remember === true ? 3 * 60 * 60 * 1000 : 60 * 60 * 1000;
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: maxAgeChange,
      sameSite: "lax",
    });
    return res
      .status(200)
      .json({ accessToken, message: "Đăng Nhập Thành Công" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

//cập nhật thông tin
export async function updateUserController(req, res) {
  const userId = req.params.id;
  console.log(userId);

  try {
    const parsed = UserUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0].message });
    }
    const { updatedUser } = await updateUser(userId, parsed.data);

    return res.status(200).json({
      message: `Cập nhật thành công người dùng id: ${updatedUser.id}`,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function getUserController(req, res) {
  try {
    const userId = req.user.id;
    const user = await getUser(userId);

    return res.status(200).json(user);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
}

export async function getAllCustomer(req, res) {
  const { idNumber } = req.query;
  const customer = await getAllCustomerService(idNumber);
  return res.status(200).json({ customer, message: "thành Công" });
}

export async function createCustomer(req, res) {
  const parsed = CreateCustomer.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }
  try {
    const result = await createCustomerService(parsed.data);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
}

export async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0].message });
    }
    const { currentPassword, newPassword } = parsed.data;
    console.log(currentPassword, newPassword, userId);

    const result = await changePasswordService(
      userId,
      currentPassword,
      newPassword
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
}
