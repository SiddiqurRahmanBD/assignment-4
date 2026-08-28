import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import { createTokenPair } from "../../utils/jwt";
import type { LoginUserPayload, RegisterUserPayload } from "./auth.interface";
import httpStatus from "http-status";
import { Role } from "../../../prisma/generated/prisma/enums";

export async function registerUser(payload: RegisterUserPayload) {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);


  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role,
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  if (user.role === Role.TECHNICIAN) {
    await prisma.technicianProfile.create({
      data: {
        userId: user.id,
        experience: "0 years",
        pricing: 0.0,
        skills: [],
      },
    });
  }
  return user;
}

export async function loginUser(payload: LoginUserPayload) {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid Email and Password");
  }
  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid Email and Password");
  }
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
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

export async function getmeUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });
  if (!user) {
    throw new AppError(401, "User not found");
  }
  return user;
}
