import {
  createAmenityRepo,
  deletedAmenityRepo,
  getAmenityRepository,
  UpdateAmenityRepo,
} from "../repositories/amenity.repo.js";

export async function getAmenityService(page, limit) {
  const [amenity, total] = await getAmenityRepository(page, limit);
  const parsedLimit = Number(limit) || 10;
  return {
    amenity,
    page: Number(page) || 1,
    limit: parsedLimit,
    totalPages: Math.ceil(total / parsedLimit),
  };
}

export async function createAmenityService({ name, description }) {
  const createdAmenity = createAmenityRepo({ name, description });
  return createdAmenity;
}

export async function deleteAmenityService(id) {
  const deleted = await deletedAmenityRepo(id);
  return deleted;
}

export async function updateAmenityService(id, { name, description }) {
  const data = {
    name,
    description,
  };
  const updatedAmenity = await UpdateAmenityRepo(id, data);
  return updatedAmenity;
}
