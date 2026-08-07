import { Router } from "express";
import {updateMyProfile} from "./user.controller";
import { auth } from "../../middleware/auth";

const userRouter = Router();

userRouter.patch("/profile", auth(), updateMyProfile)

export default userRouter;
