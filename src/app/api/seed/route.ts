import { products } from "@/data/products";
import { env, isProduction } from "@/lib/env";
import { jsonError, jsonSuccess } from "@/lib/http";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/seed
 * One-time route to seed the hardcoded products into Supabase courses table.
 * Protected by a SEED_SECRET env variable — call with ?secret=<SEED_SECRET>.
 * Remove or disable this route after seeding.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  // Safety: keep seed endpoint off in production unless explicitly enabled.
  if (isProduction() && !env.allowProductionSeed) {
    return jsonError("Not found.", 404);
  }

  if (!env.seedSecret || secret !== env.seedSecret) {
    return jsonError("Forbidden.", 403);
  }

  // Service role runs on the server only and is required for one-time seeding.
  const supabase = createAdminClient();

  const rows = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    description_detailed: p.descriptionDetailed,
    price: p.price,
    compare_at_price: p.compareAtPrice,
    category: p.category,
    rating: p.rating,
    review_count: p.reviewCount,
    downloads: p.downloads,
    modules: p.modules,
    accent: p.accent,
    included: p.included,
    outcomes: p.outcomes,
    published: true,
  }));

  const { error, count } = await supabase
    .from("courses")
    .upsert(rows, { onConflict: "slug", count: "exact" });

  if (error) {
    logger.error("Failed to seed courses.", { error });
    return jsonError(error.message, 500);
  }

  return jsonSuccess({
    message: `Seeded ${count ?? rows.length} courses successfully.`,
  });
}
