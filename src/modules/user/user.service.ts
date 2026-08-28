import prisma from "../../lib/prisma";
import type { TUpdateProfileInput } from "./user.interface";

export const updateMyProfileInDB = async (
  userId: string,
  payload: TUpdateProfileInput,
) => {
  const result = await prisma.user.update({
    where: { id: userId },
    data: payload,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      // phoneNumber: true,
      // address: true,
      createdAt: true,
    },
  });

  return result;
};
