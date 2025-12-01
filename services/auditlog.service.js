import { getAuDitLogRepo } from "../repositories/auditlog.repo.js";
import { findUserById } from "../repositories/user.repo.js";

export async function auditLogService({ day, month, year }) {
  const data = await getAuDitLogRepo({ day, month, year });

  const logsWithUsername = await Promise.all(
    data.map(async (item) => {
      const user = await findUserById(item.userId);
      return {
        ...item,
        lastName: user?.lastName || "Unknown",
        firstName: user?.firstName || "Unknown",
      };
    })
  );

  return logsWithUsername;
}
