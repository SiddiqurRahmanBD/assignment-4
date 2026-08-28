import { Role } from "../../../prisma/generated/prisma/enums";
import prisma from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import type { TCreateBookingInput } from "./booking.interface";
import httpStatus from "http-status"
export const createBookingIntoDB = async (
  userId: string,
  payload: TCreateBookingInput,
) => {
  const customer = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!customer || customer.role !== Role.CUSTOMER) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only active customers can create a booking!",
    );
  }

  const technician = await prisma.technicianProfile.findUnique({
    where: { id: payload.technicianProfileId },
    include: {
      availabilities: true,
    },
  });

  if (!technician) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Requested technician profile not found!",
    );
  }

  const service = await prisma.service.findUnique({
    where: { id: payload.serviceId },
  });

  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, "Requested service not found!");
  }

  const isSlotAvailable = technician.availabilities.some(
    (availability) =>
      availability.slot === payload.timeSlot &&
      availability.isAvailable === true,
  );

  if (!isSlotAvailable) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Selected time slot is not available for this technician!",
    );
  }

  return await prisma.booking.create({
    data: {
      customerId: customer.id,
      technicianProfileId: payload.technicianProfileId,
      serviceId: payload.serviceId,
      bookingDate: new Date(payload.bookingDate),
      timeSlot: payload.timeSlot,
      status: "REQUESTED",
    },
    include: {
      technician: true,
      service: true,
    },
  });
};

export const getMyBookingsFromDB = async (customerId: string) => {
  return await prisma.booking.findMany({
    where: { customerId },
    include: { service: true, technician: { include: { user: true } } },
  });
};

export const getBookingDetailsFromDB = async (
  customerId: string,
  bookingId: string,
) => {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { service: true, technicianProfile: { include: { user: true } } },
  });

  if (booking.customerId !== customerId) {
    throw new AppError(httpStatus.UNAUTHORIZED,"You are not authorized to view this booking!");
  }
  return booking;
};

export const cancelBookingFromDB = async (userId: string, bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new AppError(httpStatus.NOT_EXTENDED,"Booking not found!");
  }

  if (booking.customerId !== userId) {
    throw new AppError(httpStatus.UNAUTHORIZED,"You are not authorized to cancel this booking!");
  }

  if (booking.status === "CANCELLED") {
   throw new AppError(httpStatus.BAD_REQUEST,"This booking is already cancelled!");
  }
  if (booking.status === "DECLINED") {
   throw new AppError(httpStatus.BAD_REQUEST,
      "This booking has already been declined by the technician!",
    );
  }

  if (booking.status === "IN_PROGRESS" || booking.status === "COMPLETED") {
   throw new AppError(httpStatus.BAD_REQUEST,
      "Cannot cancel a booking that is already in progress or completed!",
    );
  }

  const result = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CANCELLED",
    },
  });

  return result;
};