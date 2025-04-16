import { z } from "zod";

export const RoomTypeSchema = z.object({
  name: z.string().min(1, "Tên không được để trống"),
  description: z.string().optional(),
  basePrice: z.number().nonnegative("Giá phải là số >= 0"),
  maxOccupancy: z.number().int().min(1, "Sức chứa tối thiểu là 1"),
  photoUrls: z.array(z.string().url("Mỗi ảnh phải là một URL hợp lệ")),
});

export const RoomUpdateTypeSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  basePrice: z.number().optional(),
  maxOccupancy: z.number().optional(),
  photoUrls: z.array(z.string().url()).optional(),
});
