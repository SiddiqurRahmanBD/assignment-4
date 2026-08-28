import express, { Router } from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../../prisma/generated/prisma/browser";
import { checkoutSession, getAllPayments, getSinglePayment, Webhook } from "./payment.controller";


const paymentRouter = Router();
paymentRouter.post("/checkout", auth(Role.CUSTOMER), checkoutSession);

paymentRouter.post("/webhook", Webhook);

paymentRouter.get(
  "/",
  auth(Role.CUSTOMER, Role.ADMIN),
  getAllPayments,
);

paymentRouter.get(
  "/:id",
  auth(Role.CUSTOMER, Role.ADMIN),
  getSinglePayment,
);

export default paymentRouter;
