import "server-only";

import type { ProductModule } from "@/data/products";
import type { ServerSupabaseClient } from "@/lib/supabase/types";

export type PublicCourse = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  descriptionDetailed: string;
  price: number;
  compareAtPrice: number;
  category: string;
  rating: number;
  reviewCount: number;
  downloads: string;
  modules: ProductModule[];
  accent: string;
  included: string[];
  outcomes: string[];
};

export async function listPublishedCourses(supabase: ServerSupabaseClient) {
  const { data: courses, error } = await supabase
    .from("courses")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const courseRows = courses ?? [];
  const courseIds = courseRows.map((course) => course.id);

  const { data: moduleRows, error: modulesError } = courseIds.length
    ? await supabase
        .from("course_modules")
        .select("course_id, title, description, position, published")
        .in("course_id", courseIds)
        .eq("published", true)
        .order("position", { ascending: true })
    : { data: [], error: null };

  if (modulesError) {
    throw new Error(modulesError.message);
  }

  const modulesByCourseId = new Map<string, ProductModule[]>();

  for (const moduleRow of moduleRows ?? []) {
    const existingModules = modulesByCourseId.get(moduleRow.course_id) ?? [];
    existingModules.push({
      title: moduleRow.title,
      description: moduleRow.description,
    });
    modulesByCourseId.set(moduleRow.course_id, existingModules);
  }

  return courseRows.map(
    (course): PublicCourse => ({
      id: course.id,
      slug: course.slug,
      name: course.name,
      tagline: course.tagline,
      description: course.description,
      descriptionDetailed: course.description_detailed,
      price: course.price,
      compareAtPrice: course.compare_at_price,
      category: course.category,
      rating: course.rating,
      reviewCount: course.review_count,
      downloads: course.downloads,
      modules:
        modulesByCourseId.get(course.id) ??
        (course.modules as ProductModule[]) ??
        [],
      accent: course.accent,
      included: course.included,
      outcomes: course.outcomes,
    }),
  );
}
