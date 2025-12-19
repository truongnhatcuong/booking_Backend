export const extractLimitFromMessage = (message) => {
  if (!message) return 1;

  // Bắt số nguyên trong câu (5, 10, 20...)
  const match = message.match(/\b(\d+)\b/);

  if (match) {
    const n = parseInt(match[1], 10);
    return n > 0 ? n : 1;
  }

  // Không có số → mặc định 1
  return 1;
};

export const labelByAction = (action) => {
  switch (action) {
    case "TODAY":
      return "Hôm nay";
    case "THIS_WEEK":
      return "Tuần này";
    case "THIS_MONTH":
      return "Tháng này";
    case "THIS_YEAR":
      return "Năm nay";
    default:
      return "Thống kê";
  }
};
export const safeJsonParse = (s) => {
  try {
    if (!s) return null;

    const t = String(s)
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    const a = t.indexOf("{");
    const b = t.lastIndexOf("}");
    if (a === -1 || b === -1) return null;

    return JSON.parse(t.slice(a, b + 1));
  } catch {
    return null;
  }
};
export function extractEmail(message) {
  const m = String(message || "").match(
    /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i
  );
  return m ? m[0].toLowerCase() : null;
}

export const formatNaturalText = (data, action) => {
  const label = labelByAction(action);

  const methodLabel = {
    CASH: "Tiền mặt",
    CREDIT_CARD: "Thẻ tín dụng",
    DEBIT_CARD: "Thẻ ghi nợ",
    BANK_TRANSFER: "Chuyển khoản",
    PAYPAL: "PayPal",
    MOBILE_PAYMENT: "Ví điện tử",
    QR_CODE: "QR",
  };

  const kpiTable = {
    title: `Tổng quan (${label})`,
    columns: [
      { key: "metric", label: "Chỉ số" },
      { key: "value", label: "Giá trị", type: "number" },
    ],
    rows: [
      { metric: "Phòng đã đặt", value: Number(data.roomsBooked || 0) },
      { metric: "Khách mới", value: Number(data.newCustomers || 0) },
      {
        metric: "Doanh thu",
        value: Number(data.revenue || 0),
        type: "currency",
      },
    ],
  };

  const methods = Array.isArray(data.paymentMethod) ? data.paymentMethod : [];
  const paymentTable = {
    title: "Thanh toán theo hình thức",
    columns: [
      { key: "methodLabel", label: "Phương thức" },
      { key: "total", label: "Tổng tiền", type: "currency" },
      { key: "transactions", label: "Giao dịch", type: "number" },
      { key: "percent", label: "Tỷ trọng", type: "percent" },
    ],
    rows: methods
      .map((m) => {
        const total = Number(m.total || 0);
        return {
          method: m.method,
          methodLabel: methodLabel[m.method] || m.method,
          total,
          transactions: Number(m.transactions || 0),
          percent:
            data.revenue > 0 ? Math.round((total / data.revenue) * 100) : 0,
        };
      })
      .sort((a, b) => b.total - a.total),
  };

  const topArr = Array.isArray(data.topCustomer) ? data.topCustomer : [];
  const topCustomerTable = {
    title: "Top khách VIP",
    columns: [
      { key: "rank", label: "#" },
      { key: "name", label: "Khách" },
      { key: "bookingCount", label: "Số booking", type: "number" },
      // nếu bạn muốn hiện email/phone thì mở 2 cột này
      { key: "email", label: "Email" },
      { key: "phone", label: "SĐT" },
    ],
    rows: topArr.map((c, idx) => ({
      rank: idx + 1,
      name: c.name || "Không rõ",
      bookingCount: c.bookingCount || 0,
      email: c.email || null,
      phone: c.phone || null,
    })),
  };

  return {
    kind: "MINI_STATS_TABLE",
    period: { label, from: data.from, to: data.to },
    tables: [kpiTable, paymentTable, topCustomerTable],
  };
};

export const formatRoomTablePayload = (roomNumber, action, payload) => {
  const label = labelByAction(action);

  const revenueTotal = Number(payload?.revenue?.total || 0);
  const revenueMode = payload?.revenue?.mode || "stay";

  const isOccupied = !!payload?.current?.isOccupied;
  const guestName = payload?.current?.stay?.guestName || "—";

  const kpiTable = {
    title: `Tổng quan phòng ${roomNumber} (${label})`,
    columns: [
      { key: "metric", label: "Chỉ số" },
      { key: "value", label: "Giá trị", type: "number" },
    ],
    rows: [
      { metric: "Trạng thái", value: isOccupied ? "Đang có khách" : "Trống" },
      { metric: "Khách hiện tại", value: guestName },
      {
        metric: `Doanh thu (${revenueMode})`,
        value: revenueTotal,
        type: "currency",
      },
    ],
  };

  const methods = Array.isArray(payload?.paymentMethods)
    ? payload.paymentMethods
    : [];
  const paymentTable = {
    title: "Thanh toán theo hình thức (phòng)",
    columns: [
      { key: "method", label: "Phương thức" },
      { key: "total", label: "Tổng tiền", type: "currency" },
      { key: "transactions", label: "Giao dịch", type: "number" },
      { key: "percent", label: "Tỷ trọng", type: "percent" },
    ],
    rows: methods.map((m) => {
      const total = Number(m.total || 0);
      return {
        method: m.method,
        total,
        transactions: Number(m.transactions || 0),
        percent:
          revenueTotal > 0 ? Math.round((total / revenueTotal) * 100) : 0,
      };
    }),
  };

  return {
    kind: "MINI_STATS_TABLE",
    period: {
      label: `Phòng ${roomNumber} • ${label}`,
      from: payload.from?.toISOString?.() ?? payload.from,
      to: payload.to?.toISOString?.() ?? payload.to,
    },
    tables: [kpiTable, paymentTable],
  };
};
