"use server";

import {
  ensureCertificateForCourse,
  markLessonCompletion,
} from "@/features/lms/lms-service";
import { requireAuthenticatedUser } from "@/lib/auth/require-admin";
import { revalidatePath } from "next/cache";

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function updateLessonProgress(formData: FormData) {
  const auth = await requireAuthenticatedUser();

  if (!auth.ok) {
    throw new Error(auth.error);
  }

  const lessonId = asString(formData.get("lesson_id"));
  const courseSlug = asString(formData.get("course_slug"));
  const completed = formData.get("completed") === "true";

  if (!lessonId || !courseSlug) {
    throw new Error("Missing lesson progress payload.");
  }

  const result = await markLessonCompletion(
    auth.supabase,
    auth.user.id,
    lessonId,
    completed,
  );

  if (!result.ok) {
    throw new Error(result.error);
  }

  revalidatePath("/student");
  revalidatePath(`/student/courses/${courseSlug}`);
}

export async function generateCertificate(formData: FormData) {
  const auth = await requireAuthenticatedUser();

  if (!auth.ok) {
    throw new Error(auth.error);
  }

  const courseId = asString(formData.get("course_id"));
  const courseSlug = asString(formData.get("course_slug"));

  if (!courseId || !courseSlug) {
    throw new Error("Missing course details for certificate generation.");
  }

  const result = await ensureCertificateForCourse(
    auth.supabase,
    auth.user.id,
    courseId,
  );

  if (!result.ok) {
    throw new Error(result.error);
  }

  revalidatePath("/student");
  revalidatePath(`/student/courses/${courseSlug}`);
  revalidatePath(`/student/courses/${courseSlug}/certificate`);
}
