import { prisma } from "../lib/client.js";
export async function getAuDitLogRepo({ day, month, year }) {
  let fromDate, toDate;

  if (year && month && day) {
    // Lọc theo ngày cụ thể
    fromDate = new Date(Number(year), Number(month) - 1, Number(day));
    toDate = new Date(Number(year), Number(month) - 1, Number(day) + 1);
  } else if (year && month) {
    // Lọc theo tháng
    fromDate = new Date(Number(year), Number(month) - 1, 1);
    toDate = new Date(Number(year), Number(month), 1);
  } else if (year) {
    // ✅ Trường hợp bạn đang test: chỉ có year → lọc cả năm
    fromDate = new Date(Number(year), 0, 1); // 1/1/year
    toDate = new Date(Number(year) + 1, 0, 1); // 1/1/year+1
  } else {
    // Nếu không có gì → mặc định lấy hôm nay
    const now = new Date();
    fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  }

  return await prisma.auditLog.findMany({
    where: {
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
