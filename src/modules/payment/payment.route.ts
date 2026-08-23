import { Router } from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../../prisma/generated/prisma/browser";
import { checkoutSession } from "./payment.controller";


const paymentRouter = Router();
paymentRouter.post("/checkout", auth(Role.CUSTOMER), checkoutSession);
export default paymentRouter;
