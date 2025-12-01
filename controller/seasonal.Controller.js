import {
  createSeasonalRateService,
  deleteSeasonalRateService,
  getAllSeasonalRatesService,
  updateSeasonalRateService,
} from "../services/seasonal.service.js";

export async function createSeasonalRate(req, res) {
  try {
    const { startDate, endDate, seasonName, multiplier, roomIds } = req.body;

    const seasonalRate = await createSeasonalRateService({
      startDate,
      endDate,
      seasonName,
      multiplier,
      roomIds,
    });
    return res.status(201).json({ seasonalRate });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getAllSeasonalRates(req, res) {
  try {
    const seasonalRates = await getAllSeasonalRatesService();
    return res.status(200).json({ seasonalRates });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function deleteSeasonalRate(req, res) {
  try {
    const { id } = req.params;
    await deleteSeasonalRateService(id);
    return res
      .status(200)
      .json({ message: "Seasonal rate deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateSeasonalRate(req, res) {
  try {
    const { id } = req.params;
    const { startDate, endDate, seasonName, multiplier } = req.body;

    const updatedRate = await updateSeasonalRateService(id, {
      startDate,
      endDate,
      seasonName,
      multiplier,
    });
    return res.status(200).json({ updatedRate });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi server nội bộ",
    });
  }
}
