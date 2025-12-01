import {
  createAmenityRepo,
  deletedAmenityRepo,
  getAmenityRepository,
  UpdateAmenityRepo,
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

export async function updateAmenityService(id, { name, description }) {
  const data = {
    name,
    description,
  };
  const updatedAmenity = await UpdateAmenityRepo(id, data);
  return updatedAmenity;
}
