import {
  CreateMaintenanceRepo,
  deleteMaintenanceRepo,
  GetMaintenanceRepo,
  UpdateMaintenanceRepo,
} from "../repositories/maintenance.repo.js";

export async function CreateMaintenanceService({
  description,
  startDate,
  endDate,
  status,
  cost,
  notes,
  roomId,
}) {
  const maintenance = await CreateMaintenanceRepo({
    description,
    startDate,
    endDate,
    status,
    cost,
    notes,
    roomId,
  });
  return maintenance;
}

export async function GetMaintenanceService() {
  const maintenanceRecords = await GetMaintenanceRepo();
  return maintenanceRecords;
}

export async function UpdateMaintenanceService(id, data) {
  const updatedRecord = await UpdateMaintenanceRepo(id, data);

  return updatedRecord;
}

export async function deleteMaintenanceService(id) {
  const deletedRecord = await deleteMaintenanceRepo(id);
  return deletedRecord;
}
