import { prisma } from "../lib/client.js";

const countBookingsInRange = async (from, to) => {
  return prisma.booking.count({
    where:
      from && to
        ? {
            bookingDate: {
              gte: from,
              lte: to,
            },
          }
        : {},
  });
};

const sumRevenueInRange = async (from, to) => {
  return await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: "COMPLETED",
      ...(from && to ? { paymentDate: { gte: from, lte: to } } : {}),
    },
  });
};

const countCustomersInRange = async (from, to) => {
  return prisma.customer.count({
    where:
      from && to
        ? {
            user: {
              createdAt: { gte: from, lte: to },
            },
          }
        : {},
  });
};

const RevenueTotalMonthRepo = async (year) => {
  const data = await prisma.payment.groupBy({
    by: ["paymentDate"],
    _sum: {
      amount: true,
    },
    where: {
      status: "COMPLETED",
      paymentDate: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
  });
  const RevenueTotalMonth = Array(12).fill(0);
  data.forEach((item) => {
    const month = item.paymentDate.getMonth(); // 0-11
    RevenueTotalMonth[month] = item._sum.amount || 0;
  });
  return RevenueTotalMonth;
};

const CustomerCountByMonthRepo = async (year) => {
  const results = await prisma.customer.findMany({
    where: {
      user: {
        createdAt: {
          gte: new Date(`${year}-01-01T00:00:00.000Z`),
          lte: new Date(`${year}-12-31T23:59:59.999Z`),
        },
      },
    },
    include: {
      user: true,
    },
  });
  const monthlyCounts = Array(12).fill(0);

  for (const customer of results) {
    const month = new Date(customer.user.createdAt).getMonth(); // 0-based
    monthlyCounts[month]++;
  }

  return monthlyCounts;
};

const BookingSouthRepoByMonth = async (year) => {
  const data = [];

  for (let month = 1; month <= 12; month++) {
    const startDate = new Date(year, month - 1, 1, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const bookings = await prisma.booking.groupBy({
      by: ["bookingSource"],
      where: {
        bookingSource: { in: ["WEBSITE", "DIRECT"] },
        bookingDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
    });

    let online = 0;
    let offline = 0;

    bookings.forEach((booking) => {
      if (booking.bookingSource === "WEBSITE") {
        online = booking._count.id ?? 0;
      } else if (booking.bookingSource === "DIRECT") {
        offline = booking._count.id ?? 0;
      }
    });

    data.push({ month: `Tháng ${month}`, online, offline });
  }

  return data;
};

export {
  countBookingsInRange,
  sumRevenueInRange,
  countCustomersInRange,
  RevenueTotalMonthRepo,
  CustomerCountByMonthRepo,
  BookingSouthRepoByMonth,
};
