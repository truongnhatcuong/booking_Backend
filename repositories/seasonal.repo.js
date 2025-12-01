import { prisma } from "../lib/client.js";
import cron from "node-cron";

export async function getAllSeasonalRatesRepo() {
  return await prisma.seasonalRate.findMany({
    include: {
      room: true,
    },
  });
}
export async function CreateSeasonalRateRepo(data) {
  const { startDate, endDate, seasonName, multiplier, roomIds } = data;

  const result = await prisma.$transaction(async (tx) => {
    // Duyệt qua tất cả roomIds, xử lý tuần tự hoặc song song (ở đây song song có kiểm soát)
    const promises = roomIds.map(async (roomId) => {
      const seasonalRate = await tx.seasonalRate.create({
        data: {
          startDate,
          endDate,
          seasonName,
          multiplier,
          isActive: false,
          room: { connect: { id: roomId } },
        },
      });

      // Lấy giá gốc của phòng
      const room = await tx.room.findUnique({
        where: { id: roomId },
        select: { originalPrice: true },
      });

      if (!room) {
        throw new Error(`Room not found: ${roomId}`);
      }

      const newPrice = room.originalPrice * multiplier;

      // Cập nhật giá hiện tại của phòng
      await tx.room.update({
        where: { id: roomId },
        data: { currentPrice: newPrice },
      });

      return { roomId, seasonalRate, newPrice };
    });

    const results = await Promise.all(promises);
    return results;
  });

  return result;
}
let isRunningStart = false;
cron.schedule(
  "0 0 * * *",
  async () => {
    if (isRunningStart) return;
    isRunningStart = true;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startRates = await prisma.seasonalRate.findMany({
        where: {
          startDate: { lt: today },
        },
        include: { room: true },
      });
      for (const rate of startRates) {
        await prisma.seasonalRate.update({
          where: { id: rate.id },
          data: { isActive: true },
        });
      }
    } catch (error) {
      console.error("Error in SeasonalRate cron job:", error);
    } finally {
      isRunningStart = false;
    }
  },
  { timezone: "Asia/Ho_Chi_Minh" }
);

let isRunning = false;
cron.schedule(
  "0 0 * * *",
  async () => {
    if (isRunning) return;
    isRunning = true;
    try {
      const today = new Date();
      const expiredRates = await prisma.seasonalRate.findMany({
        where: {
          endDate: { lt: today }, // hết hạn
          isActive: true, // đang bật
        },
        include: { room: true },
      });

      if (expiredRates.length === 0) return;

      for (const rate of expiredRates) {
        const room = await prisma.room.findUnique({
          where: { id: rate.roomId },
          select: { originalPrice: true },
        });

        await prisma.$transaction([
          // Trả giá về gốc
          prisma.room.update({
            where: { id: rate.roomId },
            data: { currentPrice: room.originalPrice },
          }),
          // Cập nhật trạng thái mùa
          prisma.seasonalRate.update({
            where: { id: rate.id },
            data: { isActive: false },
          }),
        ]);
      }
    } catch (error) {
      console.error("Error in SeasonalRate cron job:", error);
    } finally {
      isRunning = false;
    }
  },
  { timezone: "Asia/Ho_Chi_Minh" }
);

export async function findSeasonalRateById(id) {
  return await prisma.seasonalRate.findUnique({
    where: { id },
  });
}

export async function updateSeasonalRateRepo(id, data) {
  return await prisma.seasonalRate.update({
    where: { id },
    data,
  });
}

export async function deleteSeasonalRateRepo(id) {
  const seasonalRate = await prisma.seasonalRate.findUnique({
    where: { id },
    include: { room: true },
  });

  if (!seasonalRate) {
    throw new Error("Seasonal rate not found");
  }

  const room = await prisma.room.findUnique({
    where: { id: seasonalRate.roomId },
    select: { originalPrice: true },
  });

  await prisma.room.update({
    where: { id: seasonalRate.roomId },
    data: { originalPrice: room.originalPrice },
  });

  await prisma.seasonalRate.delete({
    where: { id },
  });

  return { message: "Seasonal rate deleted successfully" };
}
