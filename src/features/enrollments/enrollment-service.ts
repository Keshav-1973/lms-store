import "server-only";

import type { ServerSupabaseClient } from "@/lib/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listUserEnrollments(
  supabase: ServerSupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("enrollments")
    .select("id, enrolled_at, courses(id, slug, name, category, price, accent)")
    .eq("user_id", userId)
    .order("enrolled_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function ensureUserCanEnroll(
  supabase: ServerSupabaseClient,
  userId: string,
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profile?.role === "admin") {
    return {
      allowed: false,
      message: "Admin accounts cannot enroll in courses.",
    };
  }

  return { allowed: true } as const;
}

export async function enrollByCourseSlug(
  supabase: ServerSupabaseClient,
  userId: string,
  courseSlug: string,
) {
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, name")
    .eq("slug", courseSlug)
    .single();

  if (courseError || !course) {
    return { ok: false, status: 404, error: "Course not found." } as const;
  }

  const { error } = await supabase.from("enrollments").insert({
    user_id: userId,
    course_id: course.id,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        ok: true,
        status: 200,
        message: "Already enrolled in this course.",
      } as const;
    }

    return { ok: false, status: 500, error: error.message } as const;
  }

  return {
    ok: true,
    status: 201,
    message: `Enrolled in ${course.name} successfully.`,
  } as const;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function uniqueCourseSlugs(courseSlugs: string[]) {
  return Array.from(
    new Set(courseSlugs.map((slug) => slug.trim()).filter(Boolean)),
  );
}

export async function enrollUserByCourseSlugs(
  supabase: SupabaseClient,
  userId: string,
  courseSlugs: string[],
) {
  const uniqueSlugs = uniqueCourseSlugs(courseSlugs);

  if (uniqueSlugs.length === 0) {
    return 0;
  }

  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select("id")
    .in("slug", uniqueSlugs)
    .eq("published", true);

  if (coursesError) {
    throw new Error(coursesError.message);
  }

  const enrollments = (courses ?? []).map((course) => ({
    user_id: userId,
    course_id: course.id,
  }));

  if (enrollments.length === 0) {
    return 0;
  }

  const { error: insertError } = await supabase
    .from("enrollments")
    .upsert(enrollments, {
      onConflict: "user_id,course_id",
      ignoreDuplicates: true,
    });

  if (insertError) {
    throw new Error(insertError.message);
  }

  return enrollments.length;
}

export async function insertPendingPurchasesForEmail(
  supabase: SupabaseClient,
  email: string,
  courseSlugs: string[],
  stripeSessionId: string,
  purchaseMethod: string,
  options?: {
    claimed?: boolean;
    claimedByUserId?: string;
  },
) {
  const normalizedEmail = normalizeEmail(email);
  const uniqueSlugs = uniqueCourseSlugs(courseSlugs);

  if (!normalizedEmail || uniqueSlugs.length === 0) {
    return 0;
  }

  const claimed = options?.claimed ?? false;
  const claimedAt = claimed ? new Date().toISOString() : null;

  const purchases = uniqueSlugs.map((courseSlug) => ({
    email: normalizedEmail,
    course_slug: courseSlug,
    stripe_session_id: stripeSessionId,
    purchase_method: purchaseMethod,
    claimed,
    claimed_by_user_id: options?.claimedByUserId ?? null,
    claimed_at: claimedAt,
  }));

  const { error } = await supabase.from("pending_purchases").upsert(purchases, {
    onConflict: "stripe_session_id,course_slug",
    ignoreDuplicates: true,
  });

  if (
    error &&
    error.message.toLowerCase().includes("pending_purchases.purchase_method")
  ) {
    const fallbackPurchases = uniqueSlugs.map((courseSlug) => ({
      email: normalizedEmail,
      course_slug: courseSlug,
      stripe_session_id: stripeSessionId,
      claimed,
      claimed_by_user_id: options?.claimedByUserId ?? null,
      claimed_at: claimedAt,
    }));

    const { error: fallbackError } = await supabase
      .from("pending_purchases")
      .upsert(fallbackPurchases, {
        onConflict: "stripe_session_id,course_slug",
        ignoreDuplicates: true,
      });

    if (fallbackError) {
      throw new Error(fallbackError.message);
    }

    return fallbackPurchases.length;
  }

  if (error) {
    throw new Error(error.message);
  }

  return purchases.length;
}

export async function claimPendingPurchasesForUser(
  supabase: SupabaseClient,
  userId: string,
  email: string,
) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return 0;
  }

  const { data: pendingRows, error: pendingError } = await supabase
    .from("pending_purchases")
    .select("id, course_slug")
    .eq("email", normalizedEmail)
    .eq("claimed", false);

  if (pendingError) {
    throw new Error(pendingError.message);
  }

  if (!pendingRows?.length) {
    return 0;
  }

  const pendingIds = pendingRows.map((row) => row.id);
  const slugs = pendingRows.map((row) => row.course_slug);

  await enrollUserByCourseSlugs(supabase, userId, slugs);

  const { error: updateError } = await supabase
    .from("pending_purchases")
    .update({
      claimed: true,
      claimed_by_user_id: userId,
      claimed_at: new Date().toISOString(),
    })
    .in("id", pendingIds);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return pendingRows.length;
}
