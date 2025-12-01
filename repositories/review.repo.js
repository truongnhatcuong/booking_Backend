import { prisma } from "../lib/client.js";
export async function CreateReviewRepo(data) {
  const { customerId, bookingId, rating, comment } = data;
  return await prisma.review.create({
    data: {
      customerId,
      bookingId,
      rating,
      comment,
      reviewDate: new Date(),
    },
  });
}

export async function GetReviewsByBookingIdRepo(customerId) {
  return await prisma.review.findMany({
    where: {
      customerId: customerId,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      reviewDate: true,
      booking: {
        select: {
          bookingItems: {
            select: {
              room: {
                select: {
                  roomNumber: true,
                  floor: true,
                  images: {
                    take: 1,
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function PointToReviewedRepo(bookingId, customerId) {
  const review = await prisma.review.findFirst({
    where: { bookingId, customerId },
  });
  if (review) {
    return { reviewed: true, review };
  }
  return { reviewed: false };
}

export async function GetReviewsAllRepo() {
  return await prisma.review.findMany({
    select: {
      id: true,
      rating: true,
      comment: true,
      reviewDate: true,
      customer: {
        select: {
          user: {
            select: {
              id: true,
              lastName: true,
              firstName: true,
            },
          },
        },
      },
    },
  });
}
export async function DeleteReviewRepo(id) {
  return await prisma.review.delete({
    where: {
      id,
    },
  });
}
