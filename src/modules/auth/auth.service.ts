import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import type { userJwtPayload } from "../../utils/jwt";

type registerInput = {
  name: string;
  email: string;
  password: string;
  role: userJwtPayload["role"];
};

function toJwtPayload(user: {
  id: string;
  email: string;
  role: userJwtPayload["role"];
}): userJwtPayload {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

export async function registerUser(input: registerInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new AppError(409, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role,
    },
    omit: {
      password: true,
    },
  });

  return user;
}
