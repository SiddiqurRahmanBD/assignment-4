import { Router } from "express";
import { getme, login, register } from "./auth.controller";
import { auth } from "../../middleware/auth";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me",auth(), getme);

export default authRouter;
