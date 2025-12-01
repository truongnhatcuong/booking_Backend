import NotFoundError from "../errors/not-found.error.js";
import {
  CreateReviewRepo,
  DeleteReviewRepo,
  GetReviewsAllRepo,
  GetReviewsByBookingIdRepo,
  PointToReviewedRepo,
} from "../repositories/review.repo.js";

export async function createReviewService({
  customerId,
  bookingId,
  rating,
  comment,
}) {
  if (!customerId) {
    throw new NotFoundError("Customer ID is required");
  }

  if (!bookingId) {
    throw new NotFoundError("Booking ID is required");
  }

  if (rating < 1 || rating > 5) {
    throw new NotFoundError("Rating must be between 1 and 5");
  }

  const review = await CreateReviewRepo({
    customerId,
    bookingId,
    rating,
    comment,
  });

  return review;
}

export async function getReviewsByBookingIdService(customerId) {
  if (!customerId) {
    throw new NotFoundError("Customer ID is required");
  }

  const reviews = await GetReviewsByBookingIdRepo(customerId);

  return reviews;
}

export async function PointToReviewedService(bookingId, customerId) {
  const result = await PointToReviewedRepo(bookingId, customerId);
  return result;
}

export async function getAllReviewsService() {
  const reviews = await GetReviewsAllRepo();

  return reviews;
}

export async function DeleteReviewService(id) {
  if (!id) {
    throw new NotFoundError("Review ID is required");
  }
  const review = await DeleteReviewRepo(id);
  return review;
}
