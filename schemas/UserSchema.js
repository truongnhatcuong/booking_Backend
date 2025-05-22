import { z } from "zod";

export const userSchema = z.object({
  firstName: z.string().min(1, { message: "Vui lòng nhập họ" }),
  lastName: z.string().min(1, { message: "Vui lòng nhập tên" }),
  email: z
    .string()
    .email()
    .refine((val) => val.endsWith("@gmail.com"), {
      message: "Chỉ chấp nhận email Gmail",
    }),
  phone: z
    .string()
    .min(9, { message: "Số điện thoại không hợp lệ" })
    .max(12, { message: "Số điện thoại quá dài" })
    .regex(/^\d+$/, { message: "Số điện thoại chỉ được chứa số" }),
  password: z
    .string()
    .min(8, { message: "Vui lòng nhập tối thiểu 8 kí tự" })
    .max(255, { message: "Mật khẩu quá dài" }),
  address: z.string().min(1, { message: "Vui lòng nhập địa chỉ" }),
  city: z.string().min(1, { message: "Vui lòng nhập thành phố" }),
  country: z.string().min(1, { message: "Vui lòng nhập quốc gia" }),
  idNumber: z.string().min(1, { message: "Vui lòng nhập số CMND/CCCD" }),
});

export const UserUpdateSchema = z.object({
  firstName: z.string().min(1, { message: "Vui lòng nhập họ" }),
  lastName: z.string().min(1, { message: "Vui lòng nhập tên" }),
  phone: z
    .string()
    .min(9, { message: "Số điện thoại không hợp lệ" })
    .max(12, { message: "Số điện thoại quá dài" })
    .regex(/^\d+$/, { message: "Số điện thoại chỉ được chứa số" }),
  address: z.string().min(1, { message: "Vui lòng nhập địa chỉ" }),
  city: z.string().min(1, { message: "Vui lòng nhập thành phố" }),
  country: z.string().min(1, { message: "Vui lòng nhập quốc gia" }),
  idNumber: z
    .string()
    .min(9, "CMND/CCCD phải có ít nhất 9 số")
    .max(12, "CMND/CCCD không được vượt quá 12 số")
    .regex(/^\d+$/, "CMND/CCCD chỉ được chứa số"),
});

export const CreateCustomer = z.object({
  firstName: z.string().min(1, "Vui lòng nhập tên").max(50, "Tên quá dài"),

  lastName: z.string().min(1, "Vui lòng nhập họ").max(50, "Họ quá dài"),

  email: z
    .string()
    .email()
    .refine((val) => val.endsWith("@gmail.com"), {
      message: "Chỉ chấp nhận email Gmail",
    }),

  phone: z
    .string()
    .regex(/^(0|\+84)[0-9]{9,10}$/, "Số điện thoại không hợp lệ"),

  idNumber: z
    .string()
    .min(9, "CMND/CCCD phải có ít nhất 9 số")
    .max(12, "CMND/CCCD không được vượt quá 12 số")
    .regex(/^\d+$/, "CMND/CCCD chỉ được chứa số"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Mật khẩu hiện tại tối thiểu 6 ký tự"),
  newPassword: z
    .string()
    .min(6, "Mật khẩu mới tối thiểu 6 ký tự")
    .regex(/[A-Z]/, "Mật khẩu mới phải có ít nhất 1 chữ in hoa")
    .regex(/[0-9]/, "Mật khẩu mới phải có ít nhất 1 số"),
});
