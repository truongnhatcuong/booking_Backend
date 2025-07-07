import { z } from "zod";

export const blogPostSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Tiêu đề ít nhất 5 ký tự" })
    .max(200, { message: "Tiêu đề tối đa 200 ký tự" }),
  summary: z
    .string()
    .min(10, { message: "Tóm tắt ít nhất 10 ký tự" })
    .max(500, { message: "Tóm tắt tối đa 500 ký tự" }),
  content: z.string().min(20, { message: "Nội dung ít nhất 20 ký tự" }),
  coverImage: z.string().url({ message: "Ảnh bìa phải là URL hợp lệ" }),
});
