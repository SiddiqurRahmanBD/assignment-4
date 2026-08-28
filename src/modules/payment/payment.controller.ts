import type { Stripe } from "stripe";
import { AppError } from "../../utils/app-error";
import { catchAsync } from "../../utils/catch-async";
import type { Request, Response } from "express";
import httpStatus from "http-status";
import { stripe } from "../../lib/stripe";
import config from "../../config";
import { createCheckoutSession, getAllPaymentsFromDB, getSinglePaymentFromDB, handleManualPaymentConfirm, handleWebhook } from "./payment.service";
import { sendResponse } from "../../utils/send-response";

// export const webhook = catchAsync(async (req: Request, res: Response) => {
//   const signature = req.headers["stripe-signature"];
//   if (!signature) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       "Missing Stripe-Signature Header",
//     );
//   }
//   let event: Stripe.Event;
//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       signature,
//       config.STRIPE_WEBHOOK_SECRET,
//     );
//   } catch (error) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Invalid Webhook Signature");
//   }
//   const session = event.data.object;
//   //   const bookingId = session.metadata.
// });

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

// export const Webhook = catchAsync(
//   async (req: Request, res: Response) => {
//     const signature = req.headers["stripe-signature"] as string;

//     if (!signature) {
//       let bodyData = req.body;
//       if (Buffer.isBuffer(req.body)) {
//         try {
//           bodyData = JSON.parse(req.body.toString("utf-8"));
//         } catch (error) {
//           bodyData = {};
//         }
//       }

//       const bookingId = bodyData?.bookingId;

//       const result = await handleManualPaymentConfirm(bookingId);

//       return sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.OK,
//         message: "Payment confirmed successfully",
//         data: result,
//       });
//     }

//     const event = req.body as Buffer;
//     await handleWebhook(event, signature);

//     sendResponse(res, {
//       success: true,
//       statusCode: httpStatus.OK,
//       message: "Payment processed successfully via webhook",
//       data: null,
//     });
//   },
// );

export const Webhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"];

  if (!signature || Array.isArray(signature)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Missing Stripe-Signature header",
    );
  }

  await handleWebhook(req.body, signature);

  return sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment processed successfully via webhook",
    data: null,
  });
});
export const getAllPayments = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const role = req.user?.role;

    const result = await getAllPaymentsFromDB(
      userId as string,
      role as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment history retrieved successfully",
      data: result,
    });
  },
);

export const getSinglePayment = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const role = req.user?.role;
    const paymentId = req.params.id as string;

    const result = await getSinglePaymentFromDB(
      paymentId,
      userId as string,
      role as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment details retrieved successfully",
      data: result,
    });
  },
);
