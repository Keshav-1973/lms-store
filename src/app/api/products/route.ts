import {
  createProductDraft,
  listPublishedProducts,
} from "@/features/products/product-service";
import { validateProductPayload } from "@/features/products/product-validation";
import { jsonError, jsonSuccess, parseJsonBody } from "@/lib/http";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const products = await listPublishedProducts(supabase);
    return jsonSuccess({ products });
  } catch (error) {
    logger.error("Failed to fetch products.", { error });
    return jsonError("Failed to fetch products.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<{ name?: string; price?: number }>(
      request,
    );
    const validation = validateProductPayload(body);

    if (!validation.valid) {
      return jsonError(validation.error, 400);
    }

    const supabase = await createClient();
    const result = await createProductDraft(supabase, validation.value);
    return jsonSuccess(result, 201);
  } catch (error) {
    logger.error("Failed to create product.", { error });
    return jsonError("Failed to create product.", 500);
  }
}
