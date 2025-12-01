import { z } from "zod";

export const maintenanceSchema = z.object({
  description: z.string().min(5, "Mô tả phải có ít nhất 5 ký tự"),

  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Ngày bắt đầu không hợp lệ",
  }),

  endDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Ngày kết thúc không hợp lệ",
    }),

  status: z.enum([
    "SCHEDULED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "POSTPONED",
  ]),

  cost: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: "Chi phí phải là số",
    }),

  notes: z.string().optional(),

  roomId: z.string().min(1, "Vui lòng chọn phòng"),
});
