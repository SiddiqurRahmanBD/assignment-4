import { Router } from "express";
import { getAllTechnicians, getMyBookings, getSingleTechnician, updateAvailability, updateBookingStatus, updateProfile } from "./technician.controller";
import { auth } from "../../middleware/auth";

const techniciaRouter = Router();

techniciaRouter.get("/", getAllTechnicians);
techniciaRouter.get("/bookings", auth("TECHNICIAN"), getMyBookings);
techniciaRouter.get("/:id", getSingleTechnician);

techniciaRouter.put("/profile", auth("TECHNICIAN"), updateProfile);

techniciaRouter.put("/availability", auth("TECHNICIAN"), updateAvailability);

techniciaRouter.patch("/bookings/:id", auth("TECHNICIAN"), updateBookingStatus);

export default techniciaRouter;
