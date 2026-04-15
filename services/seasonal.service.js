import { prisma } from "../lib/client.js";
import {
  CreateSeasonalRateRepo,
  deleteSeasonalRateRepo,
  findSeasonalRateById,
  getAllSeasonalRatesRepo,
  updateSeasonalRateRepo,
} from "../repositories/seasonal.repo.js";

export async function createSeasonalRateService(data) {
  // Call the repository function to create a seasonal rate
  const { startDate, endDate, seasonName, multiplier, roomIds } = data;

  const seasonalRate = await CreateSeasonalRateRepo({
    startDate,
    endDate,
    seasonName,
    multiplier,
    roomIds,
  });

  return seasonalRate;
}

export async function getAllSeasonalRatesService() {
  // Call the repository function to get all seasonal rates
  const seasonalRates = await getAllSeasonalRatesRepo();
  return seasonalRates;
}

export async function deleteSeasonalRateService(id) {
  await deleteSeasonalRateRepo(id);
}

export async function updateSeasonalRateService(id, data) {
  const seasonalRate = await findSeasonalRateById(id);
  if (!seasonalRate) {
    throw new Error("Seasonal rate not found");
  }

  const today = new Date();

  // ❌ Không cho sửa nếu đang active (trừ khi chỉ toggle isActive)
  if (seasonalRate.isActive && data.isActive === undefined) {
    throw new Error("Không thể chỉnh sửa mùa giá đã kích hoạt.");
  }

  // ❌ Validate ngày
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end <= start) {
      throw new Error("Ngày kết thúc phải sau ngày bắt đầu.");
    }
  }

  // ❌ Validate multiplier
  if (data.multiplier !== undefined) {
    const multiplier = parseFloat(data.multiplier);

    if (isNaN(multiplier)) {
      throw new Error("Hệ số giá không hợp lệ");
    }

    if (multiplier < 0.5 || multiplier > 5.0) {
      throw new Error("Hệ số giá phải từ 0.5 đến 5.0");
    }
  }

  // 🔥 Xử lý bật/tắt thủ công
  if (data.isActive !== undefined) {
    const room = await prisma.room.findUnique({
      where: { id: seasonalRate.roomId },
      select: { originalPrice: true },
    });

    if (data.isActive === true) {
      // 👉 bật → áp giá mùa
      const newPrice = room.originalPrice * seasonalRate.multiplier;

      await prisma.$transaction([
        prisma.room.update({
          where: { id: seasonalRate.roomId },
          data: { currentPrice: newPrice },
        }),
        prisma.seasonalRate.update({
          where: { id },
          data: { isActive: true },
        }),
      ]);

      return;
    }

    if (data.isActive === false) {
      // 👉 tắt → trả giá về gốc
      await prisma.$transaction([
        prisma.room.update({
          where: { id: seasonalRate.roomId },
          data: { currentPrice: room.originalPrice },
        }),
        prisma.seasonalRate.update({
          where: { id },
          data: { isActive: false },
        }),
      ]);

      return;
    }
  }

  // ❌ Không cho sửa multiplier nếu đã tới ngày
  if (
    new Date(seasonalRate.startDate) <= today &&
    today <= new Date(seasonalRate.endDate)
  ) {
    throw new Error("Không thể thay đổi multiplier khi mùa đã bắt đầu.");
  }

  // ✅ update bình thường
  const updatedRate = await updateSeasonalRateRepo(id, data);
  return updatedRate;
}
