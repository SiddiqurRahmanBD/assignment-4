import { catchAsync } from "../../utils/catch-async";
import type { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../utils/send-response";
import httpStatus from "http-status";
import { registerUser } from "./auth.service";

export const register = catchAsync(
  async (req: Request, res: Response) => {

    const result = await registerUser(req.body);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User registered successfully",
      data: result,
    });
  },
);
