import { Router } from "express";
import { getAllUsers } from "./admin.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../prisma/generated/prisma/enums";

const adminRouter = Router();

adminRouter.get("/users", auth(Role.ADMIN), getAllUsers);

export default adminRouter;
