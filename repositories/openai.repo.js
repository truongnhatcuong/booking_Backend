import { prisma } from "../lib/client.js";

// Lấy phòng trống từ DB
export async function getRoom() {
  const rooms = await prisma.room.findMany({
    where: {
      status: "AVAILABLE",
    },

    select: {
      id: true,
      roomNumber: true,
      images: true,
      status: true,
      originalPrice: true,
      roomType: {
        select: {
          id: true,
          maxOccupancy: true,
          description: true,
          name: true,
          amenities: {
            select: {
              amenity: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return rooms;
}

export async function getRoomType() {
  const roomTypes = await prisma.roomType.findMany();
  return roomTypes.map((rt) => {
    const roomtypelink = `${process.env.FRONTEND_URL}/rooms/${rt.id}`;
    return `Loại Phòng: ${rt.name}
Mô tả: ${rt.description || "Không có mô tả"}
[Xem chi tiết loại phòng](${roomtypelink})`;
  });
}

export async function checkRoomAVAILABLE() {
  const rooms = await prisma.room.findMany({
    where: {
      status: "AVAILABLE",
    },
  });

  return {
    count: rooms.length,
  };
}
const toNumberSafe = (v) => {
  if (v == null) return 0;
  // Prisma Decimal thường có toNumber()
  if (typeof v?.toNumber === "function") return v.toNumber();
  // BigInt
  if (typeof v === "bigint") return Number(v);
  return Number(v) || 0;
};

// MiniStatsRepo.js

// ===== helpers =====


// range: [from, to)
const range = (from, to) => ({ gte: from, lt: to });

export const MiniStatsRepo = {
  // (1) Tổng số phòng đã đặt trong range = số booking_items của booking tạo trong range
  countRoomsBookedInRange: (from, to) =>
    prisma.bookingItem.count({
      where: { booking: { bookingDate: range(from, to) } },
    }),

  // (2) Khách hàng mới trong range (theo user.createdAt)
  countNewCustomersInRange: (from, to) =>
    prisma.customer.count({
      where: { user: { createdAt: range(from, to) } },
    }),

  // (3) Top khách đặt nhiều nhất trong range
  topCustomersByRange: async (from, to, limit = 5) => {
    const tops = await prisma.booking.groupBy({
      by: ["customerId"],
      where: { bookingDate: range(from, to) },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: limit,
    });

    if (!tops.length) return [];

    const customerIds = tops.map((t) => t.customerId);

    const customers = await prisma.customer.findMany({
      where: { id: { in: customerIds } },
      select: {
        id: true,
        user: {
          select: { firstName: true, lastName: true, email: true, phone: true },
        },
      },
    });

    const map = new Map(customers.map((c) => [c.id, c]));

    return tops.map((t) => {
      const c = map.get(t.customerId);
      const name =
        `${c?.user?.firstName || ""} ${c?.user?.lastName || ""}`.trim() ||
        "Không rõ";

      return {
        bookingCount: t._count.id,
        name,
        email: c.user.email,
        phone: c.user.phone,
      };
    });
  },

  // (4) Doanh thu trong range (Payment COMPLETED theo paymentDate)
  sumRevenueInRange: async (from, to) => {
    const result = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "COMPLETED", paymentDate: range(from, to) },
    });
    return toNumberSafe(result?._sum?.amount);
  },

  // (5) Doanh thu theo phương thức thanh toán
  revenueByMethodInRange: async (from, to) => {
    const rows = await prisma.payment.groupBy({
      by: ["paymentMethod"],
      where: { status: "COMPLETED", paymentDate: range(from, to) },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: "desc" } },
    });

    return rows.map((r) => ({
      method: r.paymentMethod,
      total: toNumberSafe(r._sum.amount),
      transactions: r._count.id,
    }));
  },

  // =========================
  // HỎI THEO PHÒNG (AI hay hỏi)
  // =========================

  // (6) Phòng 401 đang có ai ở? (dựa vào booking CHECKED_IN + overlap time)
  getCurrentGuestInRoom: async (roomNumber, at = new Date()) => {
    const item = await prisma.bookingItem.findFirst({
      where: {
        room: { roomNumber: String(roomNumber) },
        booking: {
          status: "CHECKED_IN",
          checkInDate: { lte: at },
          checkOutDate: { gt: at },
        },
      },
      select: {
        room: { select: { roomNumber: true, floor: true, status: true } },
        booking: {
          select: {
            id: true,
            status: true,
            bookingSource: true,
            checkInDate: true,
            checkOutDate: true,
            specialRequests: true,
            customer: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
            guest: { select: { fullName: true, email: true, phone: true } },
          },
        },
      },
    });

    if (!item) return { roomNumber: String(roomNumber), isOccupied: false };

    const guestName =
      item.booking.guest?.fullName ||
      `${item.booking.customer?.user?.firstName || ""} ${item.booking.customer?.user?.lastName || ""}`.trim() ||
      "Không rõ";

    const rawEmail =
      item.booking.guest?.email ?? item.booking.customer?.user?.email ?? null;
    const rawPhone =
      item.booking.guest?.phone ?? item.booking.customer?.user?.phone ?? null;

    return {
      room: item.room,
      isOccupied: true,
      stay: {
        bookingId: item.booking.id,
        guestName,
        email: rawEmail,
        phone: rawPhone,
        checkInDate: item.booking.checkInDate,
        checkOutDate: item.booking.checkOutDate,
        bookingSource: item.booking.bookingSource,
        specialRequests: item.booking.specialRequests,
      },
    };
  },

  // (7) Doanh thu phòng theo Payment (tiền thu trong range)
  roomRevenueByPaymentsInRange: async (roomNumber, from, to) => {
    const result = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "COMPLETED",
        paymentDate: range(from, to),
        booking: {
          bookingItems: { some: { room: { roomNumber: String(roomNumber) } } },
        },
      },
    });

    return toNumberSafe(result?._sum?.amount);
  },

  // (8) Doanh thu phòng theo Stay (đúng “doanh thu phòng”): pricePerNight * số đêm overlap
  roomStayRevenueInRange: async (roomNumber, from, to) => {
    const items = await prisma.bookingItem.findMany({
      where: {
        room: { roomNumber: String(roomNumber) },
        booking: {
          status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] },
          checkInDate: { lt: to },
          checkOutDate: { gt: from },
        },
      },
      select: {
        pricePerNight: true,
        booking: { select: { checkInDate: true, checkOutDate: true } },
      },
    });

    const nightsBetween = (a, b) =>
      Math.max(
        0,
        Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
      );

    let total = 0;
    for (const it of items) {
      const start = new Date(
        Math.max(it.booking.checkInDate.getTime(), from.getTime())
      );
      const end = new Date(
        Math.min(it.booking.checkOutDate.getTime(), to.getTime())
      );
      const nights = nightsBetween(start, end);
      total += Number(it.pricePerNight) * nights;
    }
    return total;
  },

  // (9) PaymentMethod riêng theo phòng
  roomRevenueByMethodInRange: async (roomNumber, from, to) => {
    const rows = await prisma.payment.groupBy({
      by: ["paymentMethod"],
      where: {
        status: "COMPLETED",
        paymentDate: range(from, to),
        booking: {
          bookingItems: { some: { room: { roomNumber: String(roomNumber) } } },
        },
      },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: "desc" } },
    });

    return rows.map((r) => ({
      method: r.paymentMethod,
      total: toNumberSafe(r._sum.amount),
      transactions: r._count.id,
    }));
  },

  // =========================
  // HỎI KHÁCH (tìm khách nhanh)
  // =========================
  searchPeople: async (q, limit = 10) => {
    const keyword = String(q || "").trim();
    if (!keyword) return { customers: [] };

    const customers = await prisma.customer.findMany({
      take: limit,
      where: {
        OR: [
          { idNumber: { contains: keyword } },
          { user: { email: { contains: keyword } } },
          { user: { phone: { contains: keyword } } },
          { user: { firstName: { contains: keyword } } },
          { user: { lastName: { contains: keyword } } },
        ],
      },
      select: {
        id: true,
        idNumber: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            status: true,
          },
        },
      },
    });

    return { customers };
  },
};
