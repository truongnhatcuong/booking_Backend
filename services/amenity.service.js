import {
  createAmenityRepo,
  deletedAmenityRepo,
  getAmenityRepository,
} from "../repositories/amenity.repo.js";

export async function getAmenityService() {
  const amenity = await getAmenityRepository();
  return { amenity };
}

export async function createAmenityService({ name, description }) {
  const createdAmenity = createAmenityRepo({ name, description });
  return createdAmenity;
}

export async function deleteAmenityService(id) {
  const deleted = await deletedAmenityRepo(id);
  return deleted;
}
