import { z } from "zod";

export const userSchema = z.object({
  firstName: z.string().min(1, { message: "Vui lòng nhập họ" }),
  lastName: z.string().min(1, { message: "Vui lòng nhập tên" }),
  email: z.string().email({ message: "Email không hợp lệ" }),
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
  idNumber: z.string().min(1, { message: "Vui lòng nhập số CMND/CCCD" }),
});
