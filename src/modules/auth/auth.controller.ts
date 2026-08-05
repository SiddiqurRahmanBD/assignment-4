import { catchAsync } from "../../utils/catch-async";
import type { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../utils/send-response";
import httpStatus from "http-status";
import { loginUser, registerUser } from "./auth.service";
import { request } from "http";

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
