import { catchAsync } from "../../utils/catch-async";
import type { Request, Response } from "express";
import { sendResponse } from "../../utils/send-response";
import httpStatus from "http-status";
import { getAllUsersFromDB } from "./admin.service";

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllUsersFromDB();
   sendResponse(res, {
     success: true,
     statusCode: httpStatus.OK,
     message: "Users profile retrieved successfully",
     data: result,
   });
});
