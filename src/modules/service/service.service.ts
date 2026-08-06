import prisma from "../../lib/prisma";
import type { IServiceFilter } from "./service.interface";

export const getAllServicesFromDB = async (filters: IServiceFilter) => {
  const { searchTerm, categoryId, location, minPrice, maxPrice, rating } =
    filters;

  const andConditions: any[] = [];
  if (searchTerm) {
    andConditions.push({
      name: {
        contains: searchTerm,
        mode: "insensitive",
      },
    });
  }

  if (categoryId) {
    andConditions.push({
      categoryId,
    });
  }

  if (minPrice || maxPrice) {
    andConditions.push({
      price: {
        gte: minPrice ? parseFloat(minPrice) : undefined,
        lte: maxPrice ? parseFloat(maxPrice) : undefined,
      },
    });
  }

  if (location) {
    andConditions.push({
      technicianProfile: {
        user: {
          address: {
            contains: location,
            mode: "insensitive",
          },
        },
      },
    });
  }

  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const services = await prisma.service.findMany({
    where: whereConditions,
    include: {
      category: true,
      technicianProfile: {
        include: {
          user: true,
          bookings: {
            include: {
              reviews: true,
            },
          },
        },
      },
    },
  });

  let result = services.map((service) => {
    const bookingsWithReviews = service.technicianProfile.bookings.filter(
      (b) => b.reviews.length > 0,
    );

    const totalRating = bookingsWithReviews.reduce(
      (sum, b) =>
        sum +
        b.reviews.reduce((reviewSum, review) => reviewSum + review.rating, 0),
      0,
    );

    const totalReviews = bookingsWithReviews.reduce(
      (count, b) => count + b.reviews.length,
      0,
    );

    const avgRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    return {
      ...service,
      averageRating: avgRating,
    };
  });

  if (rating) {
    const targetRating = parseFloat(rating);
    result = result.filter((service) => service.averageRating >= targetRating);
  }

  return result;
};

export const getSingleServiceFromDB = async (id: string) => {
  const result = await prisma.service.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
      technicianProfile: {
        include: {
          availabilities: {
            where: {
              isAvailable: false,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      },
    },
  });

  return result;
};