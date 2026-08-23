import type { Stripe } from "stripe";
import { AppError } from "../../utils/app-error";
import { catchAsync } from "../../utils/catch-async";
import type { Request, Response } from "express";
import httpStatus from "http-status";
import { stripe } from "../../lib/stripe";
import config from "../../config";
import { createCheckoutSession } from "./payment.service";
import { sendResponse } from "../../utils/send-response";

export const webhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"];
  if (!signature) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Missing Stripe-Signature Header",
    );
  }
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      config.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid Webhook Signature");
  }
  const session = event.data.object;
  //   const bookingId = session.metadata.
});

export const checkoutSession = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { bookingId } = req.body;
  const result = await createCheckoutSession(
    userId as string,
    bookingId as string,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Payment checkout session created successfully!",
    data: result,
  });
});
