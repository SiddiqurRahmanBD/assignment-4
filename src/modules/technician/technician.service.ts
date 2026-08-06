import { BookingStatus } from "../../../prisma/generated/prisma/enums";
import prisma from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import type {
    ITechnicianFilterRequest,
  TTechnicianProfileUpdateInput,
  TUpdateAvailabilityInput,
  TUpdateBookingStatusInput,
} from "./technician.interface";
import httpStatus from "http-status";

export const updateProfileIntoDB = async (
  userId: string,
  payload: TTechnicianProfileUpdateInput,
) => {
  const {
    availabilities = [],
    categoryId,
    ...profileData
  } = (payload || {}) as any;

  const isProfileExist = await prisma.technicianProfile.findUnique({
    where: { userId },
  });
  let profile;

  if (isProfileExist) {
    profile = await prisma.technicianProfile.update({
      where: { userId },
      data: profileData,
    });
  } else {
    profile = await prisma.technicianProfile.create({
      data: {
        userId,
        skills: profileData.skills || [],
        experience: profileData.experience || 0,
        pricing: profileData.pricing || 0.0,
        location: profileData.location,
      },
    });
  }

  if (categoryId) {
    await prisma.service.deleteMany({
      where: { technicianProfileId: profile.id },
    });

    await prisma.service.create({
      data: {
        name: `${profileData.skills?.[0] || "General"} Service`,
        description: `Professional ${profileData.skills?.join(", ") || "home"} services rendered by certified technician.`,
        price: profileData.pricing || 0.0,
        categoryId: categoryId,
        technicianProfileId: profile.id,
      },
    });
  }

  if (availabilities && availabilities.length > 0) {
    await prisma.availability.deleteMany({
      where: { technicianProfileId: profile.id, isBooked: false },
    });

    await prisma.availability.createMany({
      data: availabilities.map((item: { slot: string }) => ({
        technicianProfileId: profile.id,
        slot: item.slot,
        isAvailable: false,
      })),
    });
  }

  return await prisma.technicianProfile.findUnique({
    where: { userId },
    include: {
      availabilities: true,
      services: true,
    },
  });
};

export const updateAvailabilityIntoDB = async (
  userId: string,
  payload: TUpdateAvailabilityInput,
) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!technicianProfile) {
    throw new AppError(httpStatus.NOT_FOUND, "Technician profile not found!");
  }

  const slots = (payload.availabilities || []) as any[];

  await prisma.availability.deleteMany({
    where: {
      technicianProfileId: technicianProfile.id,
      isAvailable: false,
    },
  });

  await prisma.availability.createMany({
    data: slots.map((item) => ({
      technicianProfileId: technicianProfile.id,
      slot: item.slot,
      startTime: new Date(item.startTime),
      endTime: new Date(item.endTime),
      isAvailable: false,
    })),
  });

  return await prisma.technicianProfile.findUnique({
    where: { userId },
    include: { availabilities: true },
  });
};

export const getMyBookingsFromDB = async (userId: string) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!technicianProfile) {
    throw new AppError(httpStatus.NOT_FOUND, "Technician profile not found!");
  }

  return await prisma.booking.findMany({
    where: {
      technicianProfileId: technicianProfile.id,
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      service: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const updateBookingStatusInDB = async (
  userId: string,
  bookingId: string,
  payload: TUpdateBookingStatusInput,
) => {
  const status = payload.status as BookingStatus;

  if (!status) {
    const error = new Error("Status is required!");
    (error as any).statusCode = httpStatus.BAD_REQUEST;
    throw error;
  }

  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!technicianProfile) {
    const error = new Error("Technician profile not found!");
    (error as any).statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    const error = new Error("Booking not found!");
    (error as any).statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  if (booking.technicianProfileId !== technicianProfile.id) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "You are not authorized to update this booking!",
    );
  }

  if (status === BookingStatus.ACCEPTED || status === BookingStatus.DECLINED) {
    if (booking.status !== BookingStatus.REQUESTED) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Only REQUESTED bookings can be accepted or declined!",
      );
    }
  }

  if (status === BookingStatus.IN_PROGRESS) {
    if (booking.status !== BookingStatus.PAID) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Can only start jobs that are already PAID!",
      );
    }
  }

  if (status === BookingStatus.COMPLETED) {
    if (booking.status !== BookingStatus.IN_PROGRESS) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Can only complete jobs that are currently IN_PROGRESS!",
      );
    }
  }

  const result = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status,
    },
  });

  return result;
};

export const getAllTechniciansFromDB = async (filters: ITechnicianFilterRequest) => {
  const { searchTerm, categoryId, location, minPrice, maxPrice, rating } =
    filters;
  const andConditions: any[] = [];

  if (searchTerm) {
    andConditions.push({
      user: { name: { contains: searchTerm, mode: "insensitive" } },
    });
  }

  if (location) {
    andConditions.push({
      user: { address: { contains: location, mode: "insensitive" } },
    });
  }

  if (categoryId) {
    andConditions.push({ services: { some: { categoryId } } });
  }

  if (minPrice || maxPrice) {
    andConditions.push({
      pricing: {
        gte: minPrice ? parseFloat(minPrice) : undefined,
        lte: maxPrice ? parseFloat(maxPrice) : undefined,
      },
    });
  }

  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const technicians = await prisma.technicianProfile.findMany({
    where: whereConditions,
    include: {
      user: true,
      services: { include: { category: true } },
      bookings: { include: { review: true } },
      availabilitySlots: true,
    },
  });

  let result = technicians.map((tech) => {
    const bookingsWithReviews = tech.bookings.filter((b) => b.review!== null);
    const totalRating = bookingsWithReviews.reduce(
      (sum, b) => sum + (b.review?.rating || 0),
      0,
    );
    const avgRating =
      bookingsWithReviews.length > 0
        ? totalRating / bookingsWithReviews.length
        : 0;
    return { ...tech, averageRating: avgRating };
  });

  if (rating) {
    result = result.filter((tech) => tech.averageRating >= parseFloat(rating));
  }

  return result;
};

export const getSingleTechnicianFromDB = async (id: string) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: { id },
    include: {
      user: true,
      services: { include: { category: true } },
      availabilitySlots: true,
      bookings: {
        include: {
          review: {
            include: {
              customer: true,
            },
          },
        },
      },
    },
  });

  if (!technician) {
    throw new AppError(httpStatus.NOT_FOUND,"Technician profile not found");
  }

  return technician;
};
