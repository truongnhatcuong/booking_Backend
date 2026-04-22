import { prisma } from "../lib/client.js";

export async function payMentBookingRepo(data) {
  return await prisma.payment.create({
    data: {
      paymentDate: new Date(),
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      status: data.status,
      bookingId: data.bookingId,
      transactionId: data.transactionId ? data.transactionId : null,
    },
  });
}

export async function webhookpaymentRepo({ orderCode }) {
  const payment = await prisma.payment.findFirst({
    where: {
      transactionId: orderCode,
    },
    select: {
      bookingId: true
    },
  });

  await prisma.payment.updateMany({
    where: {
      transactionId: orderCode,
    },
    data: {
      status: "COMPLETED",
    },
  });

  return payment;
}

export async function deletePaymentRepo({ orderCode }) {
  const payment = await prisma.payment.findFirst({
    where: { transactionId: orderCode },
    select: {
      bookingId: true,
      id: true,
    }
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
