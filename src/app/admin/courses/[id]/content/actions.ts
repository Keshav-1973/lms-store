"use server";

import { requireAdminUser } from "@/lib/auth/require-admin";
import { revalidatePath } from "next/cache";

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function asInteger(value: FormDataEntryValue | null, fallback = 0) {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

type LessonContentType = "video" | "pdf" | "both";

const LESSON_POSITION_UNIQUE_CONSTRAINT =
  "module_lessons_module_id_position_key";

function isLessonPositionConstraintError(
  error: {
    code?: string;
    constraint?: string;
    message?: string;
  } | null,
) {
  if (!error) {
    return false;
  }

  if (error.constraint === LESSON_POSITION_UNIQUE_CONSTRAINT) {
    return true;
  }

  return (
    error.code === "23505" &&
    (error.message ?? "").includes(LESSON_POSITION_UNIQUE_CONSTRAINT)
  );
}

async function getNextLessonPosition(
  supabase: Awaited<ReturnType<typeof getAdminContext>>["supabase"],
  moduleId: string,
) {
  const { data, error } = await supabase
    .from("module_lessons")
    .select("position")
    .eq("module_id", moduleId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return typeof data?.position === "number" ? data.position + 1 : 0;
}

function normalizeLessonPayload(formData: FormData) {
  const contentTypeRaw = asString(formData.get("content_type"));
  let contentType: LessonContentType = "video";
  if (contentTypeRaw === "pdf") {
    contentType = "pdf";
  } else if (contentTypeRaw === "both") {
    contentType = "both";
  }
  const videoUrl = asString(formData.get("video_url"));
  const pdfUrl = asString(formData.get("pdf_url"));

  return {
    title: asString(formData.get("title")),
    description: asString(formData.get("description")),
    content_type: contentType,
    video_url: videoUrl || null,
    pdf_url: pdfUrl || null,
    duration_seconds: Math.max(0, asInteger(formData.get("duration_seconds"))),
    position: Math.max(0, asInteger(formData.get("position"))),
    published: asBoolean(formData.get("published")),
  };
}

async function getAdminContext() {
  const auth = await requireAdminUser();

  if (!auth.ok) {
    throw new Error(auth.error);
  }

  return auth;
}

function revalidateAdminAndLearningRoutes(
  courseId: string,
  courseSlug: string,
) {
  revalidatePath(`/admin/courses/${courseId}/content`);
  revalidatePath("/admin/courses");
  revalidatePath("/student");
  revalidatePath(`/student/courses/${courseSlug}`);
}

export async function createModule(formData: FormData) {
  const { supabase } = await getAdminContext();
  const courseId = asString(formData.get("course_id"));
  const courseSlug = asString(formData.get("course_slug"));

  const payload = {
    course_id: courseId,
    title: asString(formData.get("title")),
    description: asString(formData.get("description")),
    position: Math.max(0, asInteger(formData.get("position"))),
    published: asBoolean(formData.get("published")),
  };

  if (!payload.title) {
    throw new Error("Module title is required.");
  }

  const { error } = await supabase.from("course_modules").insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  revalidateAdminAndLearningRoutes(courseId, courseSlug);
}

export async function updateModule(formData: FormData) {
  const { supabase } = await getAdminContext();
  const moduleId = asString(formData.get("module_id"));
  const courseId = asString(formData.get("course_id"));
  const courseSlug = asString(formData.get("course_slug"));

  const payload = {
    title: asString(formData.get("title")),
    description: asString(formData.get("description")),
    position: Math.max(0, asInteger(formData.get("position"))),
    published: asBoolean(formData.get("published")),
  };

  if (!payload.title) {
    throw new Error("Module title is required.");
  }

  const { error } = await supabase
    .from("course_modules")
    .update(payload)
    .eq("id", moduleId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateAdminAndLearningRoutes(courseId, courseSlug);
}

export async function deleteModule(formData: FormData) {
  const { supabase } = await getAdminContext();
  const moduleId = asString(formData.get("module_id"));
  const courseId = asString(formData.get("course_id"));
  const courseSlug = asString(formData.get("course_slug"));

  const { error } = await supabase
    .from("course_modules")
    .delete()
    .eq("id", moduleId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateAdminAndLearningRoutes(courseId, courseSlug);
}

export async function createLesson(formData: FormData) {
  const { supabase } = await getAdminContext();
  const moduleId = asString(formData.get("module_id"));
  const courseId = asString(formData.get("course_id"));
  const courseSlug = asString(formData.get("course_slug"));

  const payload = normalizeLessonPayload(formData);

  if (!payload.title) {
    throw new Error("Lesson title is required.");
  }

  const basePayload = {
    module_id: moduleId,
    ...payload,
  };

  const { error } = await supabase.from("module_lessons").insert(basePayload);

  if (error && isLessonPositionConstraintError(error)) {
    const nextPosition = await getNextLessonPosition(supabase, moduleId);
    const { error: retryError } = await supabase.from("module_lessons").insert({
      ...basePayload,
      position: nextPosition,
    });

    if (retryError) {
      throw new Error(retryError.message);
    }

    revalidateAdminAndLearningRoutes(courseId, courseSlug);
    return;
  }

  if (error) {
    throw new Error(error.message);
  }

  revalidateAdminAndLearningRoutes(courseId, courseSlug);
}

export async function updateLesson(formData: FormData) {
  const { supabase } = await getAdminContext();
  const lessonId = asString(formData.get("lesson_id"));
  const courseId = asString(formData.get("course_id"));
  const courseSlug = asString(formData.get("course_slug"));

  const payload = normalizeLessonPayload(formData);

  if (!payload.title) {
    throw new Error("Lesson title is required.");
  }

  const { error } = await supabase
    .from("module_lessons")
    .update(payload)
    .eq("id", lessonId);

  if (error && isLessonPositionConstraintError(error)) {
    throw new Error(
      "Lesson position already exists in this module. Choose a different position.",
    );
  }

  if (error) {
    throw new Error(error.message);
  }

  revalidateAdminAndLearningRoutes(courseId, courseSlug);
}

export async function deleteLesson(formData: FormData) {
  const { supabase } = await getAdminContext();
  const lessonId = asString(formData.get("lesson_id"));
  const courseId = asString(formData.get("course_id"));
  const courseSlug = asString(formData.get("course_slug"));

  const { error } = await supabase
    .from("module_lessons")
    .delete()
    .eq("id", lessonId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateAdminAndLearningRoutes(courseId, courseSlug);
}

// Resource management actions
export async function createResource(formData: FormData) {
  const { supabase } = await getAdminContext();

  const lessonId = asString(formData.get("lesson_id"));
  const courseId = asString(formData.get("course_id"));
  const courseSlug = asString(formData.get("course_slug"));

  if (!lessonId || !courseId || !courseSlug) {
    throw new Error("Missing required fields");
  }

  const resourceType = asString(formData.get("type"));
  if (!["video", "pdf", "document"].includes(resourceType)) {
    throw new Error("Invalid resource type");
  }

  const { error } = await supabase.from("lesson_resources").insert({
    lesson_id: lessonId,
    type: resourceType,
    title: asString(formData.get("title")),
    description: asString(formData.get("description")),
    url: asString(formData.get("url")),
    position: Math.max(0, asInteger(formData.get("position"))),
    published: asBoolean(formData.get("published")),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidateAdminAndLearningRoutes(courseId, courseSlug);
}

export async function updateResource(formData: FormData) {
  const { supabase } = await getAdminContext();

  const resourceId = asString(formData.get("resource_id"));
  const courseId = asString(formData.get("course_id"));
  const courseSlug = asString(formData.get("course_slug"));

  if (!resourceId || !courseId || !courseSlug) {
    throw new Error("Missing required fields");
  }

  const resourceType = asString(formData.get("type"));
  if (!["video", "pdf", "document"].includes(resourceType)) {
    throw new Error("Invalid resource type");
  }

  const { error } = await supabase
    .from("lesson_resources")
    .update({
      type: resourceType,
      title: asString(formData.get("title")),
      description: asString(formData.get("description")),
      url: asString(formData.get("url")),
      position: Math.max(0, asInteger(formData.get("position"))),
      published: asBoolean(formData.get("published")),
    })
    .eq("id", resourceId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateAdminAndLearningRoutes(courseId, courseSlug);
}

export async function deleteResource(formData: FormData) {
  const { supabase } = await getAdminContext();

  const resourceId = asString(formData.get("resource_id"));
  const courseId = asString(formData.get("course_id"));
  const courseSlug = asString(formData.get("course_slug"));

  if (!resourceId || !courseId || !courseSlug) {
    throw new Error("Missing required fields");
  }

  const { error } = await supabase
    .from("lesson_resources")
    .delete()
    .eq("id", resourceId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateAdminAndLearningRoutes(courseId, courseSlug);
}
