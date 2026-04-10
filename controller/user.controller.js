import { setTokenCookies } from "../helper/setTokenCookies.js";
import { prisma } from "../lib/client.js";
import { hasUserPermission } from "../lib/hasUserPermission.js";
import {
  userSchema,
  UserUpdateSchema,
  CreateCustomer,
  changePasswordSchema,
  GuestSchema,
} from "../schemas/UserSchema.js";
import { updateFaceDescriptorService } from "../services/face.Service.js";
import signUp, {
  changePasswordService,
  createCustomerService,
  createGuestService,
  disableUserService,
  faceLoginService,
  forgotPasswordService,
  getAllCustomerService,
  getUser,
  login,
  refreshTokenService,
  resetPasswordService,
  updateUserService,
} from "../services/user.service.js";

// đăng kí
export default async function signUpController(req, res) {
  const parsed = userSchema.safeParse(req.body);

  console.log(req.body);

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
    const { accessToken, refreshToken } = await login({
      email,
      password,
      remember,
    });

    if (!accessToken) {
      return res.status(401).json({ message: "Đăng nhập không thành công" });
    }
    const maxAgeChange = remember ? 20 * 60 * 1000 : 15 * 60 * 1000;
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: maxAgeChange,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res
      .status(200)
      .json({ accessToken, message: "Đăng Nhập Thành Công" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function loginWithFaceController(req, res) {
  try {
    const { email, descriptor } = req.body;

    // Validation cơ bản ở layer controller
    if (!email || !descriptor?.length) {
      return res
        .status(400)
        .json({ message: "Thiếu email hoặc dữ liệu khuôn mặt" });
    }

    // Gọi service xử lý logic
    const { accessToken, refreshToken } = await faceLoginService(
      email,
      descriptor,
    );

    // Xử lý cookie và response thành công
    setTokenCookies(res, accessToken, refreshToken, false);

    return res.status(200).json({
      accessToken,
      message: "Đăng nhập thành công",
    });
  } catch (error) {
    // Mapping các mã lỗi từ service sang HTTP Status Code
    switch (error.message) {
      case "USER_NOT_FOUND":
        return res.status(404).json({ message: "Người dùng không tồn tại" });
      case "ACCOUNT_RESTRICTED":
        return res.status(403).json({ message: "Tài khoản bị hạn chế" });
      case "FACE_NOT_REGISTERED":
        return res.status(400).json({ message: "Chưa đăng ký khuôn mặt" });
      case "FACE_NOT_MATCHED":
        return res.status(401).json({
          message: "Khuôn mặt không khớp",
          distance: error.distance,
        });
      default:
        console.error(error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
  }
}

// controllers/authController.js
export async function getFaceDescriptorController(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Vui lòng cung cấp email" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { faceDescriptor: true, status: true },
    });

    if (!user)
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    if (user.status !== "ACTIVE")
      return res.status(403).json({ message: "Tài khoản bị hạn chế" });
    if (!user.faceDescriptor)
      return res.status(400).json({ message: "Chưa đăng ký khuôn mặt" });

    return res.status(200).json({
      faceDescriptor: JSON.parse(user.faceDescriptor),
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống" + error });
  }
}

export async function updateFaceDescriptorController(req, res) {
  try {
    const { descriptor } = req.body;
    const userId = req.user.id;

    if (
      !descriptor ||
      !Array.isArray(descriptor) ||
      descriptor.length !== 128
    ) {
      return res
        .status(400)
        .json({ message: "Dữ liệu khuôn mặt không hợp lệ" });
    }

    await updateFaceDescriptorService(userId, descriptor);

    return res.status(200).json({ message: "Cập nhật khuôn mặt thành công" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function deleteFaceDescriptorController(req, res) {
  try {
    const userId = req.user.id;
    await prisma.user.update({
      where: { id: userId },
      data: { faceDescriptor: null },
    });
    return res.status(200).json({ message: "Đã xóa khuôn mặt" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getFaceStatusController(req, res) {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { faceDescriptor: true },
    });
    return res.status(200).json({
      hasFace: !!user?.faceDescriptor,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

//cập nhật thông tin
export async function updateUser(req, res) {
  const userId = req.params.id;

  try {
    const parsed = UserUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0].message });
    }
    const { updatedUser } = await updateUserService(userId, parsed.data);

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

    if (!user || !userId) {
      return res.status(404).json(null);
    }

    return res.status(200).json(user);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
}

export async function getAllCustomer(req, res) {
  const { search, page, limit } = req.query;
  const customer = await getAllCustomerService(search, page, limit);
  return res.status(200).json({ customer, message: "thành Công" });
}

export async function createCustomer(req, res) {
  const parsed = CreateCustomer.safeParse(req.body);
  if (!hasUserPermission(req.user, "CUSTOMER_CREATE")) {
    return res
      .status(403)
      .json({ message: "Bạn không có quyền tạo khách hàng" });
  }

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

    const result = await changePasswordService(
      userId,
      currentPassword,
      newPassword,
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
}

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await forgotPasswordService(email);
    res.json({ message: "đã gửi email " });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    await resetPasswordService(token, password);
    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export async function disableUser(req, res) {
  try {
    const userId = req.params.id;
    if (!hasUserPermission(req.user, "CUSTOMER_UPDATE")) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền vô hiệu hóa người dùng" });
    }
    const updatedUser = await disableUserService(userId);
    return res.status(200).json({
      message: `Người dùng với ID ${userId} đã được vô hiệu hóa thành công`,
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function createGuest(req, res) {
  try {
    // const { fullName, email, phone, idNumber, checkInDate, checkOutDate } =
    //   req.body;

    const parsed = GuestSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0].message });
    }
    const newgest = await createGuestService(parsed.data);
    return res
      .status(201)
      .json({ newgest, message: "Tạo khách phụ thành công" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function refreshToken(req, res) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const newAccessToken = await refreshTokenService(refreshToken);

    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 20 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Access token mới đã được cấp",
      accessToken: newAccessToken,
    });
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
}

export async function logout(req, res) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    return res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
