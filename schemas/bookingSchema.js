import { z } from "zod";

export const BookingSchema = z
  .object({
    checkInDate: z.string(),
    checkOutDate: z.string(),
    totalGuests: z.number().min(1, "Số lượng khách phải lớn hơn 0"),
    specialRequests: z.string().optional(),
    bookingSource: z.string().min(1, "Nguồn đặt phòng là bắt buộc"),
    totalAmount: z.number().min(1, "Tổng tiền phải lớn hơn 0"),
    discountId: z.string().nullable().optional(),
    pricePerNight: z.number().min(1, "Giá mỗi đêm phải lớn hơn 0"),
    roomId: z.string().min(1, "Mã phòng là bắt buộc"),
    guestId: z.string().nullable().optional(),
  })

  // Validate ngày
  .refine(
    (data) => {
      const checkIn = new Date(data.checkInDate);
      const checkOut = new Date(data.checkOutDate);
      return checkOut > checkIn;
    },
    {
      path: ["checkOutDate"],
      message: "Ngày trả phòng phải sau ngày nhận phòng",
    }
  );
