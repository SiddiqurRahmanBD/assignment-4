import { catchAsync } from "../../utils/catch-async";
import { sendResponse } from "../../utils/send-response";
import type { Request, Response, NextFunction } from "express";
import httpStatus from "http-status"
import { createCategoryIntoDB, deleteCategoryFromDB, getAllCategoriesFromDB, getSingleCategoryFromDB, updateCategoryInDB } from "./category.service";

export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await createCategoryIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Category created successfully",
    data: result,
  });
});

export const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllCategoriesFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Categories retrieved successfully",
    data: result,
  });
});

export const getSingleCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await getSingleCategoryFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category retrieved successfully",
    data: result,
  });
});

export const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await updateCategoryInDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category updated successfully",
    data: result,
  });
});


export const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await deleteCategoryFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category deleted successfully",
    data: result,
  });
});
