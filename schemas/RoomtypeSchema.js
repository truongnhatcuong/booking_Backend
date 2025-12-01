import { z } from "zod";

export const RoomTypeSchema = z.object({
  name: z.string().min(1, "Tên không được để trống"),
  description: z.string().optional(),
  maxOccupancy: z.number().int().min(1, "Sức chứa tối thiểu là 1"),
  photoUrls: z.string(),
});

export const RoomUpdateTypeSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  maxOccupancy: z.number().optional(),
  photoUrls: z.string(),
});

const RoomStatusEnum = z.enum([
  "AVAILABLE",
  "OCCUPIED",
  "MAINTENANCE",
  "CLEANING",
  "RESERVED",
  "RESTRICTED",
]);

export const createRoomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"), // Kiểm tra room number không rỗng
  floor: z.number().int().positive("Floor number must be a positive integer"), // Kiểm tra floor là số nguyên dương
  status: RoomStatusEnum.default("AVAILABLE"), // Kiểm tra trạng thái phòng, mặc định là AVAILABLE
  notes: z.string().nullable().optional(), // Nếu có thì là string, nếu không thì null
  originalPrice: z.number().int().positive("price must be a positive integer"),
  roomTypeId: z.string().min(1, "vui lòng nhập mã loại phòng"),
  imageUrls: z.string().array().optional(),
});

export const UpdateRoomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"), // Kiểm tra room number không rỗng
  floor: z.number().int().positive("Floor number must be a positive integer"), // Kiểm tra floor là số nguyên dương
  originalPrice: z.number().int().positive("price must be a positive integer"),
  status: RoomStatusEnum.default("AVAILABLE"), // Kiểm tra trạng thái phòng, mặc định là AVAILABLE
  notes: z.string().nullable().optional(), // Nếu có thì là string, nếu không thì null
  roomTypeId: z.string().min(1, "vui lòng nhập mã loại phòng"),
});
