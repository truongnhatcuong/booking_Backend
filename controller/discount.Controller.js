import { hasUserPermission } from "../lib/hasUserPermission.js";
import {
  CreateDiscountService,
  DeleteDisCountService,
  findDiscountByCode,
  getAllDisCodeService,
} from "../services/discount.service.js";

export async function discounts(req, res) {
  const { code, percentage, validFrom, validTo } = req.body;

  if (!hasUserPermission(req.user, "REPORT_VIEW ")) {
    return res
      .status(403)
      .json({ message: "Bạn không có quyền tạo mã giảm giá" });
  }
  try {
    const discount = await CreateDiscountService({
      code,
      percentage,
      validFrom,
      validTo,
    });
    res.status(201).json({ discount, message: "Thêm Mã Giảm Giá Thành Công!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getDiscountController(req, res) {
  try {
    const { code } = req.query;

    const discount = await findDiscountByCode(code);
    return res.status(200).json({ success: true, data: discount });
  } catch (error) {
    if (
      error.message.includes("not found") ||
      error.message.includes("expired") ||
      error.message.includes("not yet valid") ||
      error.message.includes("is required")
    ) {
      return res.status(404).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: error?.message });
  }
}

export async function getAllDiscount(req, res) {
  try {
    const allDisCode = await getAllDisCodeService(req.body);
    return res.status(200).json({ allDisCode, message: "success" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error?.message });
  }
}

export async function DeleteDisCount(req, res) {
  const { id } = req.params;
  try {
    const deleteDisCount = await DeleteDisCountService(id);
    return res
      .status(200)
      .json({ deleteDisCount, message: "Mã Giảm Giá Đã Được Xóa" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error?.message });
  }
}
