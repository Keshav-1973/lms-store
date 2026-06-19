import {
  enrollByCourseSlug,
  ensureUserCanEnroll,
  listUserEnrollments,
} from "@/features/enrollments/enrollment-service";
import { requireAuthenticatedUser } from "@/lib/auth/require-admin";
import { jsonError, jsonSuccess, parseJsonBody } from "@/lib/http";
import { logger } from "@/lib/logger";

export async function GET() {
  const auth = await requireAuthenticatedUser();

  if (!auth.ok) {
    return jsonError(auth.error, auth.status);
  }

  try {
    const enrollments = await listUserEnrollments(auth.supabase, auth.user.id);
    return jsonSuccess({ enrollments });
  } catch (error) {
    logger.error("Failed to load enrollments.", {
      userId: auth.user.id,
      error,
    });
    return jsonError("Failed to fetch enrollments.", 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser();

  if (!auth.ok) {
    return jsonError(auth.error, auth.status);
  }

  const body = await parseJsonBody<{ courseSlug?: string }>(request);

  if (!body?.courseSlug) {
    return jsonError("courseSlug is required.", 400);
  }

  const eligibility = await ensureUserCanEnroll(auth.supabase, auth.user.id);

  if (!eligibility.allowed) {
    return jsonError(eligibility.message, 403);
  }

  const result = await enrollByCourseSlug(
    auth.supabase,
    auth.user.id,
    body.courseSlug,
  );

  if (!result.ok) {
    return jsonError(result.error, result.status);
  }

  return jsonSuccess({ message: result.message }, result.status);
}
