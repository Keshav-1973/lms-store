import {
  enrollUserByCourseSlugs,
  insertPendingPurchasesForEmail,
} from "@/features/enrollments/enrollment-service";
import { getStripeSecretKey, getStripeWebhookSecret } from "@/lib/env";
import { jsonError, jsonSuccess } from "@/lib/http";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function getStripeClient() {
  if (!stripeClient) {
    stripeClient = new Stripe(getStripeSecretKey());
  }

  return stripeClient;
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return jsonError("Missing Stripe signature.", 400);
  }

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = getStripeClient().webhooks.constructEvent(
      rawBody,
      signature,
      getStripeWebhookSecret(),
    );
  } catch (error) {
    logger.error("Invalid Stripe webhook signature.", { error });
    return jsonError("Invalid webhook signature.", 400);
  }

  if (event.type !== "checkout.session.completed") {
    return jsonSuccess({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.metadata?.userId;
  const cartSlugsRaw = session.metadata?.cartSlugs ?? "";
  const paymentMethod =
    session.payment_method_types?.[0]?.trim().toLowerCase() ?? "unknown";

  const cartSlugs = Array.from(
    new Set(
      cartSlugsRaw
        .split(",")
        .map((slug) => slug.trim())
        .filter(Boolean),
    ),
  );

  if (cartSlugs.length === 0) {
    logger.warn("Stripe checkout session missing cart slugs metadata.", {
      sessionId: session.id,
      userId,
    });
    return jsonSuccess({ received: true });
  }

  try {
    const supabase = createAdminClient();

    if (userId) {
      const emailForUserPurchase =
        session.customer_details?.email ?? session.customer_email;

      if (emailForUserPurchase) {
        await insertPendingPurchasesForEmail(
          supabase,
          emailForUserPurchase,
          cartSlugs,
          session.id,
          paymentMethod,
          {
            claimed: true,
            claimedByUserId: userId,
          },
        );
      }

      await enrollUserByCourseSlugs(supabase, userId, cartSlugs);
      return jsonSuccess({ received: true });
    }

    const email = session.customer_details?.email ?? session.customer_email;

    if (!email) {
      logger.warn("Stripe checkout session missing customer email.", {
        sessionId: session.id,
      });
      return jsonSuccess({ received: true });
    }

    await insertPendingPurchasesForEmail(
      supabase,
      email,
      cartSlugs,
      session.id,
      paymentMethod,
    );
  } catch (error) {
    logger.error("Unexpected error while processing Stripe webhook.", {
      error,
      sessionId: session.id,
      userId,
    });
    return jsonError("Failed to process webhook.", 500);
  }

  return jsonSuccess({ received: true });
}
