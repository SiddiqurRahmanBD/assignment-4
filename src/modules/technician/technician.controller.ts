import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catch-async";
import { getAllTechniciansFromDB, getMyBookingsFromDB, getSingleTechnicianFromDB, updateAvailabilityIntoDB, updateBookingStatusInDB, updateProfileIntoDB } from "./technician.service";
import { sendResponse } from "../../utils/send-response";


export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const payload = req.body;

  const result = await updateProfileIntoDB(userId, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Technician profile updated successfully",
    data: result,
  });
});

export const updateAvailability = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const payload = req.body;

  const result = await updateAvailabilityIntoDB(
    userId,
    payload,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Availability slots updated successfully",
    data: result,
  });
});

export const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const result = await getMyBookingsFromDB(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Technician bookings fetched successfully",
    data: result,
  });
});

export const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const bookingId = req.params.id as string;
  const payload = req.body;

  const result = await updateBookingStatusInDB(
    userId,
    bookingId,
    payload,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Booking status updated successfully",
    data: result,
  });
});

export const getAllTechnicians = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllTechniciansFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Technicians retrieved successfully",
    data: result,
  });
});

export const getSingleTechnician = catchAsync(async (req: Request, res: Response) => {
  const result = getSingleTechnicianFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Technician profile retrieved successfully",
    data: result,
  });
});