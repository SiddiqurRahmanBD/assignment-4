import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma";
import { randomUUID } from "crypto";
import { Role } from "./generated/prisma/enums";

async function main() {

const adminPassword = await bcrypt.hash("admin123", 10);
const technicianPassword = await bcrypt.hash("technician123", 10);
const customerPassword = await bcrypt.hash("customer123", 10);


const [admin, technician, customer] = await Promise.all([
  prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@gmail.com",
      password: adminPassword,
      role: Role.ADMIN,
    },
  }),
  prisma.user.create({
    data: {
      name: "Technician User",
      email: "technician@gmail.com",
      password: technicianPassword,
      role: Role.TECHNICIAN,
    },
  }),
  prisma.user.create({
    data: {
      name: "Customer User",
      email: "customer@gmail.com",
      password: customerPassword,
      role: Role.CUSTOMER,
    },
  }),
]);
console.log("Created Users:", { admin, technician, customer });

const technicianProfile = await prisma.technicianProfile.create({
  data: {
    userId: technician.id,
    skills: ["Drain Cleam, Pipe Repair"],
    experience: "2 years",
    pricing: 4500,
    location: "Dhaka, Bangladesh",
  },
});
console.log("Created Technician Profile:", technicianProfile);
const [plumbing, electrical, carpentry] = await Promise.all([
  prisma.category.create({
    data:{
      name: "Plumbing",
      description: "Plumbing services for residential and commercial needs.",
    }
  }),
  prisma.category.create({
    data:{
      name: "Electrical",
      description: "Electrical services for residential and commercial needs.",
    }
  }),
  prisma.category.create({
    data:{
    name : "Cleaning",
    description: "Cleaning services for residential and commercial needs.",
    }
  }),
  prisma.category.create({
    data:{
      name:"Painting",
      description: "Painting services for residential and commercial needs.", 
    } 
  })
]);

const [drainCleaning, pipeRepair] = await Promise.all([
  prisma.service.create({
    data:{
      name: "Drain Cleaning",
      description: "Professional drain cleaning services for residential and commercial needs.",
      price: 5000,
      categoryId: plumbing.id,
      technicianProfileId: technicianProfile.id
    }
  }),
  prisma.service.create({
    data:{
      name: "Pipe Repair",
      description: "Expert pipe repair services for residential and commercial needs.",
      price: 4000,
      categoryId: plumbing.id,
      technicianProfileId: technicianProfile.id 
    }
  })
]);


//   const carToCreate = [
//     {
//       brand: "Toyota",
//       model: "Corolla",
//       dailyRate: 12000,
//       location: "Naria, Shariatpur",
//       ownerId: owner1.id,
//     },
//     {
//       brand: "Land Rover",
//       model: "Defender",
//       dailyRate: 15000,
//       location: "Mirpur, Dhaka",
//       ownerId: owner2.id,
//     },
//     {
//       brand: "Honda",
//       model: "Civic",
//       dailyRate: 13000,
//       location: "Uttara, Dhaka",
//       ownerId: owner1.id,
//     },
//     {
//       brand: "BMW",
//       model: "X5",
//       dailyRate: 22000,
//       location: "Gulshan, Dhaka",
//       ownerId: owner2.id,
//     },
//     {
//       brand: "Hyundai",
//       model: "Tucson",
//       dailyRate: 14000,
//       location: "Chattogram",
//       ownerId: owner1.id,
//     },
//   ];
//   const cars = [];
//   for (const carData of carToCreate) {
//     const createdCar = await prisma.car.create({ data: carData });
//     cars.push(createdCar);
//   }

//   console.log(`Created ${cars.length} cars:`);

//  const bookingToCreate = [
//    {
//      car: cars[0],
//      renterId: renter1.id,
//      startDate: new Date("2026-06-01"),
//      endDate: new Date("2026-06-05"),
//      bookingStatus: BookingStatus.CONFIRMED,
//      paymentStatus: PaymentStatus.COMPLETED,
//    },
//    {
//      car: cars[1],
//      renterId: renter2.id,
//      startDate: new Date("2026-06-10"),
//      endDate: new Date("2026-06-12"),
//      bookingStatus: BookingStatus.PENDING,
//      paymentStatus: PaymentStatus.PENDING,
//    },
//    {
//      car: cars[2],
//      renterId: renter1.id,
//      startDate: new Date("2026-06-15"),
//      endDate: new Date("2026-06-18"),
//      bookingStatus: BookingStatus.CONFIRMED,
//      paymentStatus: PaymentStatus.COMPLETED,
//    },
//    {
//      car: cars[3],
//      renterId: renter1.id,
//      startDate: new Date("2026-06-20"),
//      endDate: new Date("2026-06-23"),
//      bookingStatus: BookingStatus.CANCELLED,
//      paymentStatus: PaymentStatus.FAILED,
//    },
//    {
//      car: cars[4],
//      renterId: renter2.id,
//      startDate: new Date("2026-07-01"),
//      endDate: new Date("2026-07-04"),
//      bookingStatus: BookingStatus.PENDING,
//      paymentStatus: PaymentStatus.PENDING,
//    },
//    },
//    
//  ];
//  for (const bookingData of bookingToCreate) {
//   if (bookingData.car) {
//     const totalPrice = 10 * bookingData.car.dailyRate;

//     const createdBooking = await prisma.booking.create({
//       data: {
//         carId: bookingData.car.id,
//         renterId: bookingData.renterId,
//         startDate: bookingData.startDate,
//         endDate: bookingData.endDate,
//         bookingStatus: bookingData.bookingStatus,
//         totalPrice,
//       },
//     });

//     if (bookingData.paymentStatus === PaymentStatus.PENDING) {
//       await prisma.payment.create({
//         data: {
//           bookingId: createdBooking.id,
//           amount: totalPrice,
//           status: bookingData.paymentStatus,
//           transactionId: randomUUID(),
//         },
//       });
//     }
//   }
//  }
//  console.log(`Created ${bookingToCreate.length} bookings.`);
}
main().then(()=>{
  process.exit(0);
});
