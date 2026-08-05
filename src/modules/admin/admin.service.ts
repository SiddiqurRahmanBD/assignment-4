import type { UserStatus } from "../../../prisma/generated/prisma/enums";
import prisma from "../../lib/prisma";
import { AppError } from "../../utils/app-error";

export const getAllUsersFromDB = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const updateUserStatusInDB = async (id: string, status: UserStatus) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) {
    throw new AppError(404, "User not found");
  }
  if (user.role === "ADMIN") {
    throw new AppError(400, "Admin can't be Banned");
  }

  const result = await prisma.user.update({
    where: { id },
    data: { status },
    omit: {
      password: true,
    },
  });
  return result;
};
