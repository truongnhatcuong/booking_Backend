// src/utils/dateRange.js
import { DateTime } from "luxon";
const TZ = "Asia/Ho_Chi_Minh";

export const getDateRange = (range) => {
  const now = DateTime.now().setZone(TZ);
  let from;

  switch (range) {
    case "day":
      from = now.startOf("day");
      break;
    case "week":
      from = now.minus({ days: 6 }).startOf("day");
      break;
    case "month":
      from = now.startOf("month");
      break;
    case "year":
      from = now.startOf("year");
      break;
    default:
      return {};
  }
  return { from: from.toJSDate(), to: now.toJSDate() }; // to = giờ hiện tại
};
