import { ensureUserCanEnroll } from "@/features/enrollments/enrollment-service";
import { getStripeSecretKey } from "@/lib/env";
import { jsonError, jsonSuccess, parseJsonBody } from "@/lib/http";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

type CheckoutPayload = {
  items?: Array<{
    slug?: string;
    quantity?: number;
  }>;
};

type CourseRow = {
  slug: string;
  name: string;
  price: number;
};

let stripeClient: Stripe | null = null;

function getStripeClient() {
  if (!stripeClient) {
    stripeClient = new Stripe(getStripeSecretKey());
  }

  return stripeClient;
}

function toStripeAmount(rawAmount: number) {
  return Math.round(rawAmount * 100);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const eligibility = await ensureUserCanEnroll(supabase, user.id);

    if (!eligibility.allowed) {
      return jsonError(eligibility.message, 403);
    }
  }

  try {
    const body = await parseJsonBody<CheckoutPayload>(request);

    if (!body?.items?.length) {
      return jsonError("Cart items are required.", 400);
    }

    const itemsMap = new Map<string, number>();

    for (const item of body.items) {
      const slug = item.slug?.trim();
      const quantity = item.quantity ?? 1;

      if (!slug) {
        return jsonError("Each cart item must include a slug.", 400);
      }

      if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 10) {
        return jsonError(
          "Each cart item quantity must be between 1 and 10.",
          400,
        );
      }

      itemsMap.set(slug, (itemsMap.get(slug) ?? 0) + quantity);
    }

    const slugs = Array.from(itemsMap.keys());

    const { data, error } = await supabase
      .from("courses")
      .select("slug, name, price")
      .in("slug", slugs)
      .eq("published", true);

    if (error) {
      logger.error("Failed to fetch courses for checkout.", { error, slugs });
      return jsonError("Unable to start checkout.", 500);
    }

    const courses = (data ?? []) as CourseRow[];

    if (courses.length !== slugs.length) {
      return jsonError("One or more courses are unavailable.", 400);
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      courses.map((course) => {
        const unitAmount = toStripeAmount(Number(course.price));

        if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
          throw new Error(`Invalid course price for slug ${course.slug}.`);
        }

        return {
          quantity: itemsMap.get(course.slug) ?? 1,
          price_data: {
            currency: "usd",
            product_data: {
              name: course.name,
              metadata: { slug: course.slug },
            },
            unit_amount: unitAmount,
          },
        };
      });

    const cartSlugs = slugs.join(",");
    const metadata: Record<string, string> = { cartSlugs };

    if (user?.id) {
      metadata.userId = user.id;
    }

    const origin = new URL(request.url).origin;

    const stripe = getStripeClient();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_creation: "always",
      customer_email: user?.email,
      metadata,
      success_url: `${origin}/cart?checkout=success`,
      cancel_url: `${origin}/cart?checkout=cancelled`,
    });

    if (!session.url) {
      logger.error("Stripe checkout session did not return a URL.", {
        sessionId: session.id,
      });
      return jsonError("Unable to start checkout.", 500);
    }

    return jsonSuccess({ url: session.url });
  } catch (error) {
    logger.error("Failed to create Stripe checkout session.", { error });
    return jsonError("Unable to start checkout.", 500);
  }
}
