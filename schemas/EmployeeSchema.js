import { z } from "zod";
export const employeeSchema = z.object({
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
  position: z.string().min(1, { message: "vui lòng nhập dữ liệu" }),
  department: z
    .enum(["FRONT_DESK", "MAINTENANCE", "MANAGEMENT", "ACCOUNTING"])
    .refine((val) => !!val, {
      message: "Vui lòng nhập dữ liệu",
    }),
});
