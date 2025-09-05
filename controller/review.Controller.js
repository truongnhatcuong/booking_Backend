import {
  createReviewService,
  DeleteReviewService,
  getAllReviewsService,
  getReviewsByBookingIdService,
  PointToReviewedService,
} from "../services/review.service.js";

export async function CreateReview(req, res) {
  try {
    const { bookingId, rating, comment } = req.body;
    const customerId = req.user.customer.id;

    const review = await createReviewService({
      customerId,
      bookingId,
      rating,
      comment,
    });

    return res.status(201).json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
export async function PointToReviewed(req, res) {
  const { bookingId } = req.query;
  const customerId = req.user.customer.id;
  console.log("hi", bookingId, customerId);

  try {
    const bookings = await PointToReviewedService(bookingId, customerId);
    return res.status(200).json({ bookings, message: "Thành Công" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function GetReviewsByBookingId(req, res) {
  try {
    const customerId = req.user.customer.id;

    const reviews = await getReviewsByBookingIdService(customerId);

    return res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function GetAllReviews(req, res) {
  try {
    const reviews = await getAllReviewsService(req.body);

    return res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function DeleteReview(req, res) {
  try {
    const { id } = req.params;

    const review = await DeleteReviewService(id);

    return res
      .status(200)
      .json({ review, message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
