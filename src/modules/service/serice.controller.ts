import { catchAsync } from "../../utils/catch-async";
import type { Request, Response } from "express";
import {
    createServiceToDB,
  getAllServicesFromDB,
  getSingleServiceFromDB,
} from "./service.service";
import { sendResponse } from "../../utils/send-response";
import httpStatus from "http-status";

export const getAllService = catchAsync(async (req: Request, res: Response) => {
  const filters = req.query;
  const result = await getAllServicesFromDB(filters);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Services retrieved successfully",
    data: result,
  });
});

export const getSingleService = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await getSingleServiceFromDB(id);
    
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Service retrieved successfully",
      data: result,
    });
  },
);

export const createService = catchAsync(
  async (req: Request, res: Response) => {
    const result = await createServiceToDB(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Service created successfully",
      data: result,
    });
  },
);
