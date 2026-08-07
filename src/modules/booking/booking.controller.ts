import type { Request, Response } from "express";
import httpStatus from "http-status";
import { cancelBookingFromDB, createBookingIntoDB, getBookingDetailsFromDB, getMyBookingsFromDB } from "./booking.service";
import { catchAsync } from "../../utils/catch-async";
import { sendResponse } from "../../utils/send-response";



export const createBooking = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const payload = req.body;

  const result = await createBookingIntoDB(userId, payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Booking requested successfully!",
    data: result,
  });
});

export const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await getMyBookingsFromDB(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Bookings fetched successfully",
    data: result,
  });
});

export const getBookingDetails = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await getBookingDetailsFromDB(
    userId,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Booking details fetched successfully",
    data: result,
  });
});

export const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const bookingId = req.params.id as string;

  const result = await cancelBookingFromDB(userId, bookingId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Booking cancelled successfully",
    data: result,
  });
});