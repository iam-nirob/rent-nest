import { prisma } from "../../lib/prisma";
import { createHttpError } from "../../utils/appError";
import { ICreateReviewPayload } from "./review.interface";

// Tenant: leave a review for a property after their rental is COMPLETED
const createReviewDB = async (
  payload: ICreateReviewPayload,
  tenantId: string,
) => {
  if (!payload.rating || payload.rating < 1 || payload.rating > 5) {
    throw createHttpError("rating must be between 1 and 5", 400);
  }

  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: payload.rentalRequestId },
    include: { reviews: true },
  });

  if (!rentalRequest) {
    throw createHttpError("Rental request not found", 404);
  }

  if (rentalRequest.tenantId !== tenantId) {
    throw createHttpError(
      "You can only review your own completed rentals",
      403,
    );
  }

  if (rentalRequest.status !== "COMPLETED") {
    throw createHttpError(
      "You can only leave a review after your rental is completed",
      400,
    );
  }

  if (rentalRequest.reviews) {
    throw createHttpError(
      "You have already left a review for this rental",
      400,
    );
  }

  const review = await prisma.reviews.create({
    data: {
      rating: payload.rating,
      comment: payload.comment,
      rentalRequestId: rentalRequest.id,
      tenantId,
      propertyId: rentalRequest.propertyId,
    },
  });

  return review;
};

export const reviewService = {
  createReviewDB,
};
