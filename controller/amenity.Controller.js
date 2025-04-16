import {
  createAmenityService,
  deleteAmenityService,
  getAmenityService,
} from "../services/amenity.service.js";

export async function amenityGet(req, res) {
  const { amenity } = await getAmenityService();
  return res.status(200).json({ amenity, message: "thành công" });
}

export default async function amenityCreate(req, res) {
  const { name, description } = await req.body;
  if (!name || !description) {
    res.status(400).json({ message: "vui lòng nhập thông tin" });
  }
  const amenity = await createAmenityService({ name, description });
  res.status(201).json({ amenity, message: "Tạo thành công" });
}

export async function amenityDelete(req, res) {
  try {
    const amenityId = req.params.id;

    const result = await deleteAmenityService(amenityId);

    return res
      .status(200)
      .json({ message: `đã xóa thành công id ${result.id}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
