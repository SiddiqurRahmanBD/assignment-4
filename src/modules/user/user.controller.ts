import { catchAsync } from "../../utils/catch-async";
import type { Request, Response } from "express";
import httpStatus from "http-status";
import { sendResponse } from "../../utils/send-response";
import { updateMyProfileInDB } from "./user.service";
export const updateMyProfile = catchAsync(
  async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const result = await updateMyProfileInDB(userId, req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Profile updated successfully",
      data: result,
    });
  },
);
