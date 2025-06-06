import { maintenanceSchema } from "../schemas/MaintenanceSchema.js";
import {
  CreateMaintenanceService,
  deleteMaintenanceService,
  GetMaintenanceService,
  UpdateMaintenanceService,
} from "../services/maintenance.service.js";

export async function CreateMaintenance(req, res) {
  const parsed = maintenanceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const { description, startDate, endDate, status, cost, notes, roomId } =
    parsed.data;
  const safeParsedStartDate = new Date(startDate);
  const safeParsedEndDate = new Date(endDate);
  try {
    const maintenance = await CreateMaintenanceService({
      description,
      startDate: safeParsedStartDate,
      endDate: safeParsedEndDate,
      status,
      cost,
      notes,
      roomId,
    });

    return res.status(201).json({
      maintenance,
      message: "Maintenance record created successfully",
    });
  } catch (error) {
    console.error("Error creating maintenance record:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function GetMaintenance(req, res) {
  try {
    const maintenanceRecords = await GetMaintenanceService(req.body);
    return res.status(200).json(maintenanceRecords);
  } catch (error) {
    console.error("Error fetching maintenance records:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function UpdateMaintenance(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!id || !status) {
    return res.status(400).json({ message: "ID and status are required" });
  }

  try {
    const updatedRecord = await UpdateMaintenanceService(id, { status });
    return res.status(200).json({
      updatedRecord,
      message: "Maintenance record updated successfully",
    });
  } catch (error) {
    console.error("Error updating maintenance record:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteMaintenance(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "ID is required" });
  }

  try {
    const deletedRecord = await deleteMaintenanceService(id);
    return res.status(200).json({
      deletedRecord,
      message: "Maintenance record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting maintenance record:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
