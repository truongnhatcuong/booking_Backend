import {
  createAmenityService,
  deleteAmenityService,
  getAmenityService,
  updateAmenityService,
} from "../services/amenity.service.js";

export async function amenityGet(req, res) {
  const { amenity } = await getAmenityService();
  return res.status(200).json({ amenity, message: "thành công" });
}

export default async function amenityCreate(req, res) {
  const { name, description } = await req.body;
  if (!name || !description) {
    return res.status(400).json({ message: "vui lòng nhập thông tin" });
  }
  const amenity = await createAmenityService({ name, description });
  return res.status(201).json({ amenity, message: "Tạo thành công" });
}

export async function amenityDelete(req, res) {
  try {
    const amenityId = req.params.id;

    const result = await deleteAmenityService(amenityId);

    return res
      .status(200)
      .json({ message: `đã xóa thành công id ${result.id}` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function amenityUpdate(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({ message: "vui lòng nhập thông tin" });
    }
    const updatedAmenity = await updateAmenityService(id, {
      name,
      description,
    });
    return res
      .status(200)
      .json({ updatedAmenity, message: "Cập nhật thành công" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
