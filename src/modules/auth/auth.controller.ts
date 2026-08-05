import { catchAsync } from "../../utils/catch-async";
import type { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../utils/send-response";
import httpStatus from "http-status";
import { getmeUser, loginUser, registerUser } from "./auth.service";

export const register = catchAsync(async (req: Request, res: Response) => {
  const result = await registerUser(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User registered successfully",
    data: result,
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const result = await loginUser(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User Login Successfully",
    data: result,
  });
});

export const getme = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user!.id;
  const result = await getmeUser(userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User profile retrieved successfully",
    data: result,
  });
});
