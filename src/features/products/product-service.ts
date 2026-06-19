import "server-only";

import type { ServerSupabaseClient } from "@/lib/supabase/types";
import { slugify } from "@/lib/text";

export async function listPublishedProducts(supabase: ServerSupabaseClient) {
  const { data: products, error } = await supabase
    .from("courses")
    .select("id, slug, name, price, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return products ?? [];
}

export async function createProductDraft(
  supabase: ServerSupabaseClient,
  payload: { name: string; price: number },
) {
  const baseSlug = slugify(payload.name) || "product";
  const generatedSlug = `${baseSlug}-${Date.now().toString(36)}`;

  const { data, error } = await supabase
    .from("courses")
    .insert({
      slug: generatedSlug,
      name: payload.name,
      price: payload.price,
      published: false,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    insertedId: data.id,
    slug: generatedSlug,
  };
}
