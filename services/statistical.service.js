import {
  BookingSouthRepoByMonth,
  countBookingsInRange,
  countCustomersInRange,
  CustomerCountByMonthRepo,
  RevenueTotalMonthRepo,
  sumRevenueInRange,
} from "../repositories/statistical.repo.js";

const getDateRange = (range) => {
  const now = new Date();
  const from = new Date();
  switch (range) {
    case "day":
      from.setHours(0, 0, 0, 0);
      break;
    case "week":
      from.setDate(now.getDate() - 6);
      from.setHours(0, 0, 0, 0);
      break;
    case "month":
      from.setDate(1);
      from.setHours(0, 0, 0, 0);
      break;
    case "year":
      from.setMonth(0, 1);
      from.setHours(0, 0, 0, 0);
      break;
    default:
      return {};
  }
  return {
    from,
    to: now,
  };
};

export async function getStatisticalService(range) {
  const { from, to } = getDateRange(range);
  const [bookings, revenue, totalAmount, customers] = await Promise.all([
    countBookingsInRange(from, to),
    sumRevenueInRange(),
    sumRevenueInRange(from, to),
    countCustomersInRange(from, to),
  ]);

  return {
    bookings,
    revenue: revenue._sum.amount || 0,
    totalAmount: totalAmount._sum.amount || 0,
    customers,
  };
}

export async function RevenueTotalMonthService(
  year = new Date().getFullYear()
) {
  const RevenueTotalMonth = await RevenueTotalMonthRepo(year);
  const months = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);
  return {
    months,
    data: RevenueTotalMonth,
  };
}

export async function CustomerCountByMonthService(
  year = new Date().getFullYear()
) {
  const counts = await CustomerCountByMonthRepo(year);
  const months = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);
  return { months, counts };
}

export const getRevenueOnlineOfflineService = async (year) => {
  const revenueBookingResource = await BookingSouthRepoByMonth(year);
  return {
    data: revenueBookingResource,
  };
};
