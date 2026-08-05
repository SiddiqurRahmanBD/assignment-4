import { catchAsync } from "../../utils/catch-async";
import type { Request, Response } from "express";
import { sendResponse } from "../../utils/send-response";
import httpStatus from "http-status";
import { getAllUsersFromDB, updateUserStatusInDB } from "./admin.service";
import { AppError } from "../../utils/app-error";

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllUsersFromDB();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users profile retrieved successfully",
    data: result,
  });
});

export const updateUserStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

     if (!id || typeof id !== "string") {
     throw new AppError(httpStatus.BAD_REQUEST,"Valid User ID is required!"); 
     }
    const { status } = req.body;
    

    const result = await updateUserStatusInDB(id, status);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User status updated successfully",
      data: result,
    });
  },
);