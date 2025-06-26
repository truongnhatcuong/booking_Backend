import { auditLogService } from "../services/auditlog.service.js";

export async function getAuditLog(req, res) {
  const { day, month, year } = req.query;
  console.log("day", day, "month :", month, "year:", year);

  try {
    const parsedParams = {
      day: day ? parseInt(day) : undefined,
      month: month ? parseInt(month) : undefined,
      year: year ? parseInt(year) : undefined,
    };

    const data = await auditLogService(parsedParams);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json(error);
  }
}
