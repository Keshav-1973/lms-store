import { listPublishedCourses } from "@/features/courses/course-service";
import { jsonError, jsonSuccess } from "@/lib/http";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const courses = await listPublishedCourses(supabase);
    return jsonSuccess({ courses });
  } catch (error) {
    logger.error("Failed to load published courses.", { error });
    return jsonError("Failed to fetch courses.", 500);
  }
}
