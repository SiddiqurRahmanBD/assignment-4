
import prisma from "../../lib/prisma";
import type { ICategory } from "./category.interface";


export const createCategoryIntoDB = async (payload: ICategory) => {
  return await prisma.category.create({
    data: payload,
  });
};

export const getAllCategoriesFromDB = async () => {
  return await prisma.category.findMany({
    include: {
      services: true,
    },
  });
};

export const getSingleCategoryFromDB = async (id: string) => {
  return await prisma.category.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      services: true,
    },
  });
};

// Update Category
export const updateCategoryInDB = async (
  id: string,
  payload: { name?: string; description?: string },
) => {
  const result = await prisma.category.update({
    where: { id },
    data: payload,
  });
  return result;
};

// Delete Category
export const deleteCategoryFromDB = async (id: string) => {
  const result = await prisma.category.delete({
    where: { id },
  });
  return result;
};
