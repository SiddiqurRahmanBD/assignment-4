import { Router } from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../../prisma/generated/prisma/enums";
import { cancelBooking, createBooking, getBookingDetails, getMyBookings } from "./booking.controller";

const bookingRouter = Router();

bookingRouter.post("/", auth(Role.CUSTOMER), createBooking);
bookingRouter.get("/", auth(Role.CUSTOMER), getMyBookings);
bookingRouter.get("/:id", auth(Role.CUSTOMER), getBookingDetails);
bookingRouter.patch("/:id/cancel", auth(Role.CUSTOMER), cancelBooking);

export default bookingRouter;
