import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma";
import { BookingStatus, PaymentProvider, PaymentStatus, Role, UserStatus } from "./generated/prisma/enums";


async function main() {
  console.log("🌱 Seeding database...");

  // Clean database
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.service.deleteMany();
  await prisma.category.deleteMany();
  await prisma.technicianProfile.deleteMany();
  await prisma.user.deleteMany();

  // Passwords
  const adminPassword = await bcrypt.hash("admin123", 10);
  const technicianPassword = await bcrypt.hash("technician123", 10);
  const customerPassword = await bcrypt.hash("customer123", 10);

  // ==========================
  // USERS
  // ==========================

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@gmail.com",
      password: adminPassword,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const technician = await prisma.user.create({
    data: {
      name: "Technician User",
      email: "technician@gmail.com",
      password: technicianPassword,
      role: Role.TECHNICIAN,
      status: UserStatus.ACTIVE,
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "Customer User",
      email: "customer@gmail.com",
      password: customerPassword,
      role: Role.CUSTOMER,
      status: UserStatus.ACTIVE,
    },
  });

  console.log("✅ Users created");

  // ==========================
  // TECHNICIAN PROFILE
  // ==========================

  const technicianProfile = await prisma.technicianProfile.create({
    data: {
      userId: technician.id,
      skills: ["Drain Cleaning", "Pipe Repair"],
      experience: "2 Years",
      pricing: 4500,
      location: "Dhaka, Bangladesh",
    },
  });

  // ==========================
  // CATEGORIES
  // ==========================

  const [plumbing, electrical, cleaning, painting] = await Promise.all([
    prisma.category.create({
      data: {
        name: "Plumbing",
        description: "Plumbing services",
      },
    }),

    prisma.category.create({
      data: {
        name: "Electrical",
        description: "Electrical services",
      },
    }),

    prisma.category.create({
      data: {
        name: "Cleaning",
        description: "Cleaning services",
      },
    }),

    prisma.category.create({
      data: {
        name: "Painting",
        description: "Painting services",
      },
    }),
  ]);

  // ==========================
  // SERVICES
  // ==========================

  const [drainCleaning, pipeRepair] = await Promise.all([
    prisma.service.create({
      data: {
        name: "Drain Cleaning",
        description: "Professional drain cleaning service",
        price: 5000,
        categoryId: plumbing.id,
        technicianProfileId: technicianProfile.id,
      },
    }),

    prisma.service.create({
      data: {
        name: "Pipe Repair",
        description: "Professional pipe repair service",
        price: 4000,
        categoryId: plumbing.id,
        technicianProfileId: technicianProfile.id,
      },
    }),
  ]);

  // ==========================
  // AVAILABILITY
  // ==========================

  await prisma.availability.create({
    data: {
      technicianProfileId: technicianProfile.id,
      slot: "Morning",
      startTime: new Date("2026-08-10T09:00:00Z"),
      endTime: new Date("2026-08-10T12:00:00Z"),
    },
  });

  // ==========================
  // BOOKING
  // ==========================

  const booking = await prisma.booking.create({
    data: {
      customerId: customer.id,
      technicianProfileId: technicianProfile.id,
      serviceId: drainCleaning.id,
      status: BookingStatus.COMPLETED,
      bookingDate: new Date(),
      timeSlot: "09:00 AM - 11:00 AM",
    },
  });

  // ==========================
  // PAYMENT
  // ==========================

  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      amount: drainCleaning.price,
      transactionId: "TXN-10001",
      provider: PaymentProvider.STRIPE,
      status: PaymentStatus.COMPLETED,
    },
  });

  // ==========================
  // REVIEW
  // ==========================

  await prisma.review.create({
    data: {
      bookingId: booking.id,
      customerId: customer.id,
      technicianProfileId: technicianProfile.id,
      rating: 5,
      comment: "Excellent service!",
    },
  });

  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
