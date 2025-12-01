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
  // 1️⃣ Lấy seasonal rate hiện tại từ DB
  const seasonalRate = await findSeasonalRateById(id);
  if (!seasonalRate) {
    throw new Error("Seasonal rate not found");
  }
  // 2️⃣ Quy tắc: nếu mùa đang active thì không cho chỉnh sửa
  if (seasonalRate.isActive) {
    throw new Error("Không thể chỉnh sửa mùa giá đã kích hoạt .");
  }
  // 3️⃣ Quy tắc: kiểm tra logic ngày tháng (nếu người dùng cố cập nhật sai)
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end <= start) {
      throw new Error("Ngày kết thúc phải sau ngày bắt đầu.");
    }
  }
  if (data.multiplier !== undefined) {
    const multiplier = parseFloat(data.multiplier);

    if (isNaN(multiplier)) {
      throw new Error("Hệ số giá không hợp lệ");
    }

    if (multiplier < 0.5 || multiplier > 5.0) {
      throw new Error("Hệ số giá phải từ 0.5 đến 5.0");
    }
  }
  const today = new Date();
  if (new Date(seasonalRate.startDate) <= today && !seasonalRate.isActive) {
    throw new Error("Không thể thay đổi multiplier khi mùa đã bắt đầu.");
  }
  // 4️⃣ Cập nhật seasonal rate
  const updatedRate = await updateSeasonalRateRepo(id, data);
  return updatedRate;
}
