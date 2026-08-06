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

}
main().then(()=>{
  process.exit(0);
});
