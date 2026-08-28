import prisma from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { AppError } from "../../utils/app-error";
import httpStatus from "http-status";
import config from "../../config";
import type { Stripe } from "stripe";
import { Role } from "../../../prisma/generated/prisma/enums";
export const createCheckoutSession = async (
  userId: string,
  bookingId: string,
) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUniqueOrThrow({
      where: {
        id: bookingId,
      },
      include: {
        service: true,
        payment: true,
      },
    });

    if (booking?.customerId !== userId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Unauthorized access to this booking!",
      );
    }

    if (booking.status !== "ACCEPTED") {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Payment is only allowed for accepted bookings.",
      );
    }
   if (booking.payment?.status === "COMPLETED") {
     throw new AppError(
       httpStatus.BAD_REQUEST,
       "Payment has already been paid.",
     );
   }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "USD",
            unit_amount: Math.round(booking.service.price * 100),
            product_data: {
              name: booking.service.name,
              description: `FixItNow Service - Booking Date: ${booking.bookingDate}`,
            },
          },
        },
      ],
      metadata: {
        bookingId: booking.id,
        userId: booking.customerId,
      },

      success_url: `${config.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
      cancel_url: `${config.CLIENT_URL}/payment/cancel`,
    });
    return session.url;
  });
  return transactionResult;
};

export const handleManualPaymentConfirm = async (bookingId: string) => {
  if (!bookingId) {
    throw new Error("Booking ID is required to confirm payment");
  }

  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { service: true },
  });

  return await prisma.$transaction(async (tx) => {
    const existingPayment = await tx.payment.findUnique({
      where: { bookingId },
    });

    if (existingPayment) {
      return existingPayment;
    }

    const stripeTransactionId = `pi_${Math.random().toString(36).substring(2, 12)}${Date.now().toString(36)}`;

    const payment = await tx.payment.create({
      data: {
        bookingId,
        amount: booking.service.price,
        provider: "STRIPE",
        status: "COMPLETED",
        transactionId: stripeTransactionId,
        paidAt: new Date(),
      },
    });

    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "PAID" },
    });

    return payment;
  });
};


export const handleWebhook = async (payload: Buffer, signature: string) => {
  const endpointSecret = config.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  // 1. Verify Stripe webhook signature
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      endpointSecret as string,
    );
  } catch (err: any) {
    console.error(" WEBHOOK SIGNATURE ERROR:", err.message);

    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Webhook signature verification failed: ${err.message}`,
    );
  }

  // console.log(" Stripe event received:", event.type);

  // 2. Ignore events we don't need
  if (event.type !== "checkout.session.completed") {
    // console.log(" Ignoring event:", event.type);
    return;
  }

  // 3. Get Checkout Session
  const session = event.data.object as Stripe.Checkout.Session;

  console.log("📦 Checkout session:", {
    id: session.id,
    payment_status: session.payment_status,
    payment_intent: session.payment_intent,
    amount_total: session.amount_total,
    metadata: session.metadata,
  });

  // 4. Get booking ID from Stripe metadata
  const bookingId = session.metadata?.bookingId;

  if (!bookingId) {
    // console.error("Booking ID missing from metadata");

    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Required metadata missing from Stripe session.",
    );
  }


  // 5. Make sure payment was successful
  if (session.payment_status !== "paid") {
  
    throw new AppError(httpStatus.BAD_REQUEST, "Payment process incomplete.");
  }

  // 6. Create payment + update booking atomically
  await prisma.$transaction(async (tx) => {
    // Check if payment already exists
    const existingPayment = await tx.payment.findUnique({
      where: {
        bookingId,
      },
    });

    if (existingPayment) {
      // console.log("Payment already exists:", existingPayment.id);

      return;
    }

    // Stripe PaymentIntent ID is the best transaction ID
    const transactionId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.id;

    console.log("💳 Creating payment...", {
      bookingId,
      amount: (session.amount_total ?? 0) / 100,
      transactionId,
    });

    // 7. Create payment
    const payment = await tx.payment.create({
      data: {
        bookingId,
        amount: (session.amount_total ?? 0) / 100,
        provider: "STRIPE",
        status: "COMPLETED",
        transactionId,
        paidAt: new Date(),
      },
    });

    // console.log("Payment created:", payment.id);

    // 8. Update booking status
    await tx.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: "PAID",
      },
    });

    // console.log("Booking updated to PAID");
  });

  // console.log(" Webhook processing completed");
};
export const getAllPaymentsFromDB = async (userId: string, role: string) => {
  let queryFilter = {};

  if (role === Role.CUSTOMER) {
    queryFilter = {
      booking: {
        customerId: userId,
      },
    };
  }

  const result = await prisma.payment.findMany({
    where: queryFilter,
    include: {
      booking: {
        include: {
          service: true,
        },
      },
    },
    orderBy: {
      paidAt: "desc",
    },
  });

  return result;
};

export const getSinglePaymentFromDB = async (
  paymentId: string,
  userId: string,
  role: string,
) => {
  const payment = await prisma.payment.findUniqueOrThrow({
    where: {
      id: paymentId,
    },
    include: {
      booking: {
        include: {
          service: true,
        },
      },
    },
  });

  if (role === Role.CUSTOMER && payment.booking.customerId !== userId) {
    throw new Error("Unauthorized access to this payment details!");
  }

  return payment;
};
