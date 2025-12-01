import NotFoundError from "../errors/not-found.error.js";
import {
  createDisCoutRepo,
  DeleteDisCountRepo,
  getAllDisCodeRepo,
  getDisCountCodeRepo,
  updateDisCoutRepo,
} from "../repositories/discount.repo.js";

export async function CreateDiscountService(data) {
  const { code, percentage, validFrom, validTo } = data;

  // Basic validation
  if (!code || !percentage) {
    throw new NotFoundError("Code and percentage are required");
  }

  if (percentage < 0 || percentage > 100) {
    throw new NotFoundError("Percentage must be between 0 and 100");
  }

  if (validFrom && validTo && new Date(validFrom) > new Date(validTo)) {
    throw new NotFoundError("Valid from date must be before valid to date");
  }

  const result = await createDisCoutRepo({
    code,
    percentage,
    validFrom,
    validTo,
  });
  return result;
}
export async function updateDisCoutService(id, data) {
  const { code, percentage, validFrom, validTo } = data;

  const updateDiscount = await updateDisCoutRepo(id, {
    code,
    percentage,
    validFrom,
    validTo,
  });
  return updateDiscount;
}

export async function findDiscountByCode(code) {
  if (!code || code.trim() === "") {
    return null;
  }

  const discount = await getDisCountCodeRepo(code);
  if (!discount) {
    throw new NotFoundError("Mã Giảm Giá Không Đúng");
  }

  const now = new Date();
  if (now < new Date(discount.validFrom)) {
    throw new NotFoundError("Mã giảm giá chưa có hiệu lực");
  }
  if (now > new Date(discount.validTo)) {
    throw new NotFoundError("Mã giảm giá đã hết hạn");
  }

  return discount;
}

export async function getAllDisCodeService() {
  const discode = await getAllDisCodeRepo();
  return discode;
}

export async function DeleteDisCountService(id) {
  const discode = await getAllDisCodeRepo();
  if (!discode[0].id) {
    throw new NotFoundError("Mã Giảm Giá Không Tồn Tại");
  }
  const deleteDisCount = await DeleteDisCountRepo(id);
  return deleteDisCount;
}
