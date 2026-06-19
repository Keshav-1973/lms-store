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

function normalizeLessonPayload(formData: FormData) {
  const contentTypeRaw = asString(formData.get("content_type"));
  const contentType: LessonContentType =
    contentTypeRaw === "pdf"
      ? "pdf"
      : contentTypeRaw === "both"
        ? "both"
        : "video";
  const videoUrl = asString(formData.get("video_url"));
  const pdfUrl = asString(formData.get("pdf_url"));

  return {
    title: asString(formData.get("title")),
    description: asString(formData.get("description")),
    content_type: contentType,
    video_url:
      contentType === "video" || contentType === "both"
        ? videoUrl || null
        : null,
    pdf_url:
      contentType === "pdf" || contentType === "both" ? pdfUrl || null : null,
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

  if (
    (payload.content_type === "video" || payload.content_type === "both") &&
    !payload.video_url
  ) {
    throw new Error("Video URL is required for video lessons.");
  }

  if (
    (payload.content_type === "pdf" || payload.content_type === "both") &&
    !payload.pdf_url
  ) {
    throw new Error("PDF URL is required for PDF lessons.");
  }

  const { error } = await supabase.from("module_lessons").insert({
    module_id: moduleId,
    ...payload,
  });

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

  if (
    (payload.content_type === "video" || payload.content_type === "both") &&
    !payload.video_url
  ) {
    throw new Error("Video URL is required for video lessons.");
  }

  if (
    (payload.content_type === "pdf" || payload.content_type === "both") &&
    !payload.pdf_url
  ) {
    throw new Error("PDF URL is required for PDF lessons.");
  }

  const { error } = await supabase
    .from("module_lessons")
    .update(payload)
    .eq("id", lessonId);

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
