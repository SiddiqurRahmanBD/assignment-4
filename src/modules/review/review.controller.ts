import type { Request, Response } from "express";


import httpStatus from "http-status";
import { sendResponse } from "../../utils/send-response";
import { createReviewIntoDB, deleteReviewFromDB, getAllReviewsFromDB } from "./review.service";
import { catchAsync } from "../../utils/catch-async";

export const createReview = catchAsync(
  async (req: Request, res: Response) => {
    const result = await createReviewIntoDB(
      req.user!.id,
      req.body,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Review created successfully",
      data: result,
    });
  },
);

export const getAllReviews = catchAsync(
  async (req: Request, res: Response) => {
    const result = await getAllReviewsFromDB();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Reviews retrieved successfully",
      data: result,
    });
  },
);

export const deleteReview = catchAsync(
  async (req: Request, res: Response) => {
    const reviewId = req.params.id as string;
    const userId = req.user!.id;
    const role = req.user!.role;

    await deleteReviewFromDB(reviewId, userId, role);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Review deleted successfully",
      data: null,
    });
  },
);