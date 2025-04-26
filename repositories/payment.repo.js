import { Prisma } from "@prisma/client";
import { prisma } from "../lib/client.js";

export async function payMentBookingRepo(data) {
  return await prisma.payment.create({
    data: {
      paymentDate: new Date(),
      amount: new Prisma.Decimal(data.amount),
      paymentMethod: data.paymentMethod,
      status: "PENDING",
      bookingId: data.bookingId,
    },
  });
}
