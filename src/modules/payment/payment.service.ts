import prisma from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { AppError } from "../../utils/app-error";
import httpStatus from "http-status";
import config from "../../config";
import type { Stripe } from "stripe";
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

export const handleWebhook = async (payload: Buffer, signature: string) => {
  const endpointSecret = config.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      endpointSecret as string,
    );
  } catch (err: any) {
    throw new Error(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (session.payment_status !== "paid") {
      throw new Error("Payment process incomplete.");
    }
    if (!bookingId) {
      throw new Error("Required metadata missing from Stripe session.");
    }

    await prisma.$transaction(async (tx) => {
      const existingPayment = await tx.payment.findFirst({
        where: {
          bookingId,
        },
      });

      if (existingPayment) {
        return;
      }

      const validTransactionId =
        (session.payment_intent as string) ||
        session.id ||
        `pi_${Math.random().toString(36).substring(2, 12)}${Date.now().toString(36)}`;

      await tx.payment.create({
        data: {
          bookingId,
          amount: (session.amount_total ?? 0) / 100,
          provider: "STRIPE",
          status: "COMPLETED",
          transactionId: validTransactionId,
          method: "CARD",
          paidAt: new Date(),
        },
      });

      await tx.booking.update({
        where: {
          id: bookingId,
        },
        data: {
          status: "PAID",
        },
      });
    });
  }
};


