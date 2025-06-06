import { Prisma } from "@prisma/client";
import { prisma } from "../lib/client.js";

export async function payMentBookingRepo(data) {
  return await prisma.payment.create({
    data: {
      paymentDate: new Date(),
      amount: new Prisma.Decimal(data.amount),
      paymentMethod: data.paymentMethod,
      status: data.status,
      bookingId: data.bookingId,
      transactionId: data.transactionId ? data.transactionId : null,
    },
  });
}

export async function webhookpaymentRepo({ orderCode }) {
  return await prisma.payment.update({
    where: {
      transactionId: orderCode,
    },
    data: {
      status: "COMPLETED",
    },
  });
}

export async function deletePaymentRepo({ orderCode }) {
  const payment = await prisma.payment.findFirst({
    where: { transactionId: orderCode },
  });

  await prisma.bookingItem.deleteMany({
    where: { bookingId: payment.bookingId },
  });

  await prisma.payment.delete({
    where: { id: payment.id },
  });

  return await prisma.booking.delete({
    where: { id: payment.bookingId },
  });
}
