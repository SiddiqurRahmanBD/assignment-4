import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma";
import { BookingStatus, PaymentStatus, Role } from "./generated/prisma/browser";
import { randomUUID } from "crypto";

async function main() {
  const password = await bcrypt.hash("password", 10);

  const [owner1, owner2, renter1, renter2, admin] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Spider Man",
        email: "spider.man@gmail.com",
        password,
        role: Role.OWNER,
      },
    }),
    prisma.user.create({
      data: {
        name: "Iron Man",
        email: "iron.man@gmail.com",
        password,
        role: Role.OWNER,
      },
    }),
    prisma.user.create({
      data: {
        name: "Bat Man",
        email: "bat.man@gmail.com",
        password,
        role: Role.RENTER,
      },
    }),
    prisma.user.create({
      data: {
        name: "Super Man",
        email: "super.man@gmail.com",
        password,
        role: Role.RENTER,
      },
    }),
    prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@gmail.com",
        password,
        role: Role.ADMIN,
      },
    }),
  ]);
  console.log("Created users:", { owner1, owner2, renter1, renter2, admin });
  const carToCreate = [
    {
      brand: "Toyota",
      model: "Corolla",
      dailyRate: 12000,
      location: "Naria, Shariatpur",
      ownerId: owner1.id,
    },
    {
      brand: "Land Rover",
      model: "Defender",
      dailyRate: 15000,
      location: "Mirpur, Dhaka",
      ownerId: owner2.id,
    },
    {
      brand: "Honda",
      model: "Civic",
      dailyRate: 13000,
      location: "Uttara, Dhaka",
      ownerId: owner1.id,
    },
    {
      brand: "BMW",
      model: "X5",
      dailyRate: 22000,
      location: "Gulshan, Dhaka",
      ownerId: owner2.id,
    },
    {
      brand: "Hyundai",
      model: "Tucson",
      dailyRate: 14000,
      location: "Chattogram",
      ownerId: owner1.id,
    },
  ];
  const cars = [];
  for (const carData of carToCreate) {
    const createdCar = await prisma.car.create({ data: carData });
    cars.push(createdCar);
  }

  console.log(`Created ${cars.length} cars:`);

 const bookingToCreate = [
   {
     car: cars[0],
     renterId: renter1.id,
     startDate: new Date("2026-06-01"),
     endDate: new Date("2026-06-05"),
     bookingStatus: BookingStatus.CONFIRMED,
     paymentStatus: PaymentStatus.COMPLETED,
   },
   {
     car: cars[1],
     renterId: renter2.id,
     startDate: new Date("2026-06-10"),
     endDate: new Date("2026-06-12"),
     bookingStatus: BookingStatus.PENDING,
     paymentStatus: PaymentStatus.PENDING,
   },
   {
     car: cars[2],
     renterId: renter1.id,
     startDate: new Date("2026-06-15"),
     endDate: new Date("2026-06-18"),
     bookingStatus: BookingStatus.CONFIRMED,
     paymentStatus: PaymentStatus.COMPLETED,
   },
   {
     car: cars[3],
     renterId: renter1.id,
     startDate: new Date("2026-06-20"),
     endDate: new Date("2026-06-23"),
     bookingStatus: BookingStatus.CANCELLED,
     paymentStatus: PaymentStatus.FAILED,
   },
   {
     car: cars[4],
     renterId: renter2.id,
     startDate: new Date("2026-07-01"),
     endDate: new Date("2026-07-04"),
     bookingStatus: BookingStatus.PENDING,
     paymentStatus: PaymentStatus.PENDING,
   },
   {
     car: cars[0],
     renterId: renter1.id,
     startDate: new Date("2026-07-08"),
     endDate: new Date("2026-07-11"),
     bookingStatus: BookingStatus.CONFIRMED,
     paymentStatus: PaymentStatus.COMPLETED,
   },
   {
     car: cars[2],
     renterId: renter1.id,
     startDate: new Date("2026-07-15"),
     endDate: new Date("2026-07-17"),
     bookingStatus: BookingStatus.CANCELLED,
     paymentStatus: PaymentStatus.FAILED,
   },
   {
     car: cars[1],
     renterId: renter2.id,
     startDate: new Date("2026-07-20"),
     endDate: new Date("2026-07-25"),
     bookingStatus: BookingStatus.CONFIRMED,
     paymentStatus: PaymentStatus.COMPLETED,
   },
 ];
 for (const bookingData of bookingToCreate) {
  if (bookingData.car) {
    const totalPrice = 10 * bookingData.car.dailyRate;

    const createdBooking = await prisma.booking.create({
      data: {
        carId: bookingData.car.id,
        renterId: bookingData.renterId,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        bookingStatus: bookingData.bookingStatus,
        totalPrice,
      },
    });

    if (bookingData.paymentStatus === PaymentStatus.PENDING) {
      await prisma.payment.create({
        data: {
          bookingId: createdBooking.id,
          amount: totalPrice,
          status: bookingData.paymentStatus,
          transactionId: randomUUID(),
        },
      });
    }
  }
 }
 console.log(`Created ${bookingToCreate.length} bookings.`);
}
main().then(()=>{
  process.exit(0);
});
