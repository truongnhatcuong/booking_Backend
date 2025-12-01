import { prisma } from "../lib/client.js";
export async function CreateMaintenanceRepo(data) {
  const { description, startDate, endDate, status, cost, notes, roomId } = data;
  await prisma.room.update({
    where: { id: roomId },
    data: { status: "MAINTENANCE" },
  });
  return await prisma.maintenanceRecord.create({
    data: {
      description,
      startDate,
      endDate,
      status,
      cost,
      notes,
      roomId,
    },
  });
}

export async function GetMaintenanceRepo() {
  return await prisma.maintenanceRecord.findMany({
    select: {
      id: true,
      description: true,
      startDate: true,
      endDate: true,
      status: true,
      cost: true,
      notes: true,
      room: {
        select: {
          id: true,
          roomNumber: true,
          floor: true,
          images: {
            take: 1,
            select: {
              imageUrl: true,
            },
          },
        },
      },
    },
  });
}

export async function UpdateMaintenanceRepo(id, data) {
  const { status } = data;

  const updatedRecord = await prisma.maintenanceRecord.update({
    where: { id },
    data: {
      status: status,
      endDate: status === "COMPLETED" ? new Date() : undefined,
    },
  });
  if (status === "COMPLETED") {
    await prisma.room.update({
      where: { id: updatedRecord.roomId },
      data: { status: "AVAILABLE" },
    });
  }
  return updatedRecord;
}

export async function deleteMaintenanceRepo(id) {
  const maintenanceRecord = await prisma.maintenanceRecord.delete({
    where: { id },
  });
  await prisma.room.update({
    where: { id: maintenanceRecord.roomId },
    data: { status: "AVAILABLE" },
  });
  return maintenanceRecord;
}
