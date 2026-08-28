import { Router } from "express";
import { createCategory, getAllBookings, getAllCategories, getAllUsers, updateUserStatus } from "./admin.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../prisma/generated/prisma/enums";

const adminRouter = Router();

adminRouter.get("/users", auth(Role.ADMIN), getAllUsers);
adminRouter.patch("/users/:id", auth(Role.ADMIN), updateUserStatus);
adminRouter.get("/bookings", auth(Role.ADMIN), getAllBookings);
adminRouter.post("/categories", auth(Role.ADMIN), createCategory);
adminRouter.get("/categories", auth(Role.ADMIN), getAllCategories);

export default adminRouter;
