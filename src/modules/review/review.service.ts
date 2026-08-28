import { Role } from "../../../prisma/generated/prisma/enums";
import prisma from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import type { IReview } from "./review.interface";
import httpStatus from "http-status";

export const createReviewIntoDB = async (userId: string, payload: IReview) => {
  const { bookingId, rating, comment } = payload;

  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
  });

  if (booking.customerId !== userId) {
    throw new AppError(httpStatus.UNAUTHORIZED,"You are not authorized to review this booking!");
    
  }

if (booking.status !== "COMPLETED") {
  throw new AppError(
    httpStatus.BAD_REQUEST,
    "You can only leave a review after the job is completed!",
  );
}
  const existingReview = await prisma.review.findUnique({
    where: { bookingId },
  });

  if (existingReview) {
    throw new AppError(httpStatus.BAD_REQUEST,"You have already reviewed this booking!");

  }

const result = await prisma.review.create({
  data: {
    rating,
    comment,
    bookingId,
    customerId: userId,
    technicianProfileId: booking.technicianProfileId,
  },
  include: {
    customer: true,
    technicianProfile: {
      include: {
        user: true,
      },
    },
    booking: {
      include: {
        technician: {
          include: {
            user: true,
          },
        },
        service: true,
      },
    },
  },
});

  return result;
};

export const getAllReviewsFromDB = async () => {
  return await prisma.review.findMany({
    include: {
      customer: true,
      booking: {
        include: {
          technician: {
            include: {
              user: true,
            },
          },
          service: true,
        },
      },
    },
  });
};

export const deleteReviewFromDB = async (
  reviewId: string,
  userId: string,
  role: string,
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    const error = new Error("Review not found!");
    (error as any).statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  if (role === Role.CUSTOMER && review.customerId !== userId) {
    const error = new Error("You are not authorized to delete this review!");
    (error as any).statusCode = httpStatus.UNAUTHORIZED;
    throw error;
  }

  return await prisma.review.delete({
    where: { id: reviewId },
  });
};
