import { Router } from "express";
import { getAllUsers, updateUserStatus } from "./admin.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../prisma/generated/prisma/enums";

const adminRouter = Router();

adminRouter.get("/users", auth(Role.ADMIN), getAllUsers);
adminRouter.patch("/users/:id", auth(Role.ADMIN), updateUserStatus);

export default adminRouter;
