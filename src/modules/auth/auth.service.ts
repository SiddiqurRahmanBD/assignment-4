import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import { createTokenPair, type userJwtPayload } from "../../utils/jwt";
import type { LoginUserPayload, RegisterUserPayload } from "./auth.interface";
import app from "../../app";
import { email } from "zod";
import { status } from "http-status";

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

export async function registerUser(payload: RegisterUserPayload) {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new AppError(409, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role,
    },
    omit: {
      password: true,
    },
  });

  return user;
}

export async function loginUser(payload: LoginUserPayload) {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError(401, "Invalid Email and Password");
  }
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    password: user.password,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
  return {
    user: safeUser,
    ...createTokenPair({ id: user.id, email: user.email, role: user.role }),
  };
}
