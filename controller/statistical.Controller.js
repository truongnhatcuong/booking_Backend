import {
  CustomerCountByMonthService,
  getRevenueOnlineOfflineService,
  getStatisticalService,
  RevenueTotalMonthService,
} from "../services/statistical.service.js";

export async function getStatisticalController(req, res) {
  const { range } = req.query;
  try {
    const data = await getStatisticalService(range);
    return res.status(200).json({
      bookings: data.bookings,
      revenue: data.revenue,
      totalAmount: data.totalAmount,
      customers: data.customers,
    });
  } catch (error) {
    console.error("Error fetching statistical data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getRevenueTotalMonthController(req, res) {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  try {
    const data = await RevenueTotalMonthService(year);
    return res.status(200).json({
      months: data.months,
      data: data.data,
    });
  } catch (error) {
    console.error("Error fetching revenue total month:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export const CustomerCountByMonthController = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const data = await CustomerCountByMonthService(year);
    res.json({ success: true, data });
  } catch (err) {
    console.error("Error getCustomerCountByMonthController:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getRevenueOnlineOfflineController = async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  try {
    const { data } = await getRevenueOnlineOfflineService(year);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error revenue online/offline:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
