import "server-only";

import type { ServerSupabaseClient } from "@/lib/supabase/types";
import { randomUUID } from "node:crypto";

export type LessonContentType = "video" | "pdf" | "both";

export type CourseModule = {
  id: string;
  course_id: string;
  title: string;
  description: string;
  position: number;
  published: boolean;
};

export type ModuleLesson = {
  id: string;
  module_id: string;
  title: string;
  description: string;
  content_type: LessonContentType;
  video_url: string | null;
  pdf_url: string | null;
  duration_seconds: number;
  position: number;
  published: boolean;
};

type LessonProgressRow = {
  lesson_id: string;
  completed: boolean;
};

export type StudentLesson = ModuleLesson & {
  completed: boolean;
};

export type StudentCourseModule = CourseModule & {
  lessons: StudentLesson[];
};

export type StudentCourseLearningData = {
  course: {
    id: string;
    slug: string;
    name: string;
  };
  modules: StudentCourseModule[];
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  certificate: {
    id: string;
    certificate_number: string;
    issued_at: string;
  } | null;
};

export type CourseProgressSummary = {
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
};

function toProgressPercent(completedLessons: number, totalLessons: number) {
  if (totalLessons <= 0) {
    return 0;
  }

  return Math.round((completedLessons / totalLessons) * 100);
}

export async function listCourseContentForAdmin(
  supabase: ServerSupabaseClient,
  courseId: string,
) {
  const { data: modules, error: modulesError } = await supabase
    .from("course_modules")
    .select("id, course_id, title, description, position, published")
    .eq("course_id", courseId)
    .order("position", { ascending: true });

  if (modulesError) {
    throw new Error(modulesError.message);
  }

  const moduleRows = (modules ?? []) as CourseModule[];
  const moduleIds = moduleRows.map((moduleRow) => moduleRow.id);

  const { data: lessons, error: lessonsError } = moduleIds.length
    ? await supabase
        .from("module_lessons")
        .select(
          "id, module_id, title, description, content_type, video_url, pdf_url, duration_seconds, position, published",
        )
        .in("module_id", moduleIds)
        .order("position", { ascending: true })
    : { data: [], error: null };

  if (lessonsError) {
    throw new Error(lessonsError.message);
  }

  const lessonRows = (lessons ?? []) as ModuleLesson[];

  return moduleRows.map((moduleRow) => ({
    ...moduleRow,
    lessons: lessonRows.filter((lesson) => lesson.module_id === moduleRow.id),
  }));
}

export async function getStudentCourseLearningData(
  supabase: ServerSupabaseClient,
  userId: string,
  courseSlug: string,
): Promise<StudentCourseLearningData | null> {
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, slug, name, published")
    .eq("slug", courseSlug)
    .single();

  if (courseError || !course) {
    return null;
  }

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", course.id)
    .maybeSingle();

  if (enrollmentError) {
    throw new Error(enrollmentError.message);
  }

  if (!enrollment) {
    return null;
  }

  const { data: modules, error: modulesError } = await supabase
    .from("course_modules")
    .select("id, course_id, title, description, position, published")
    .eq("course_id", course.id)
    .eq("published", true)
    .order("position", { ascending: true });

  if (modulesError) {
    throw new Error(modulesError.message);
  }

  const moduleRows = (modules ?? []) as CourseModule[];
  const moduleIds = moduleRows.map((moduleRow) => moduleRow.id);

  const { data: lessons, error: lessonsError } = moduleIds.length
    ? await supabase
        .from("module_lessons")
        .select(
          "id, module_id, title, description, content_type, video_url, pdf_url, duration_seconds, position, published",
        )
        .in("module_id", moduleIds)
        .eq("published", true)
        .order("position", { ascending: true })
    : { data: [], error: null };

  if (lessonsError) {
    throw new Error(lessonsError.message);
  }

  const lessonRows = (lessons ?? []) as ModuleLesson[];
  const lessonIds = lessonRows.map((lesson) => lesson.id);

  const { data: progressRows, error: progressError } = lessonIds.length
    ? await supabase
        .from("lesson_progress")
        .select("lesson_id, completed")
        .eq("user_id", userId)
        .in("lesson_id", lessonIds)
    : { data: [], error: null };

  if (progressError) {
    throw new Error(progressError.message);
  }

  const progressByLessonId = new Map<string, boolean>();

  for (const row of (progressRows ?? []) as LessonProgressRow[]) {
    progressByLessonId.set(row.lesson_id, row.completed);
  }

  const totalLessons = lessonRows.length;
  const completedLessons = lessonRows.filter((lesson) => {
    return progressByLessonId.get(lesson.id) === true;
  }).length;

  const { data: certificate, error: certificateError } = await supabase
    .from("course_certificates")
    .select("id, certificate_number, issued_at")
    .eq("user_id", userId)
    .eq("course_id", course.id)
    .maybeSingle();

  if (certificateError) {
    throw new Error(certificateError.message);
  }

  const modulesWithLessons = moduleRows.map((moduleRow) => {
    const lessonsForModule = lessonRows
      .filter((lesson) => lesson.module_id === moduleRow.id)
      .map((lesson) => ({
        ...lesson,
        completed: progressByLessonId.get(lesson.id) === true,
      }));

    return {
      ...moduleRow,
      lessons: lessonsForModule,
    };
  });

  return {
    course: {
      id: course.id,
      slug: course.slug,
      name: course.name,
    },
    modules: modulesWithLessons,
    totalLessons,
    completedLessons,
    progressPercent: toProgressPercent(completedLessons, totalLessons),
    certificate: certificate
      ? {
          id: certificate.id,
          certificate_number: certificate.certificate_number,
          issued_at: certificate.issued_at,
        }
      : null,
  };
}

export async function markLessonCompletion(
  supabase: ServerSupabaseClient,
  userId: string,
  lessonId: string,
  completed: boolean,
) {
  const { data: lesson, error: lessonError } = await supabase
    .from("module_lessons")
    .select("id, module_id")
    .eq("id", lessonId)
    .maybeSingle();

  if (lessonError) {
    throw new Error(lessonError.message);
  }

  if (!lesson) {
    return { ok: false, error: "Lesson not found." } as const;
  }

  const { data: moduleRow, error: moduleError } = await supabase
    .from("course_modules")
    .select("course_id")
    .eq("id", lesson.module_id)
    .maybeSingle();

  if (moduleError) {
    throw new Error(moduleError.message);
  }

  if (!moduleRow) {
    return { ok: false, error: "Module not found." } as const;
  }

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("id")
    .eq("course_id", moduleRow.course_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (enrollmentError) {
    throw new Error(enrollmentError.message);
  }

  if (!enrollment) {
    return {
      ok: false,
      error: "You are not enrolled in this course.",
    } as const;
  }

  const now = new Date().toISOString();

  const { error: upsertError } = await supabase.from("lesson_progress").upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      completed,
      completed_at: completed ? now : null,
      last_viewed_at: now,
    },
    {
      onConflict: "user_id,lesson_id",
    },
  );

  if (upsertError) {
    throw new Error(upsertError.message);
  }

  return { ok: true } as const;
}

export async function ensureCertificateForCourse(
  supabase: ServerSupabaseClient,
  userId: string,
  courseId: string,
) {
  const { data: existingCertificate, error: existingError } = await supabase
    .from("course_certificates")
    .select("id, certificate_number, issued_at")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existingCertificate) {
    return {
      ok: true,
      certificate: existingCertificate,
    } as const;
  }

  const { data: modules, error: modulesError } = await supabase
    .from("course_modules")
    .select("id")
    .eq("course_id", courseId)
    .eq("published", true);

  if (modulesError) {
    throw new Error(modulesError.message);
  }

  const moduleIds = (modules ?? []).map((moduleRow) => moduleRow.id);

  if (moduleIds.length === 0) {
    return {
      ok: false,
      error: "No published lessons found for this course.",
    } as const;
  }

  const { data: lessons, error: lessonsError } = await supabase
    .from("module_lessons")
    .select("id")
    .in("module_id", moduleIds)
    .eq("published", true);

  if (lessonsError) {
    throw new Error(lessonsError.message);
  }

  const lessonIds = (lessons ?? []).map((lesson) => lesson.id);

  if (lessonIds.length === 0) {
    return {
      ok: false,
      error: "No published lessons found for this course.",
    } as const;
  }

  const { data: completedRows, error: completedError } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .eq("completed", true)
    .in("lesson_id", lessonIds);

  if (completedError) {
    throw new Error(completedError.message);
  }

  const completedCount = (completedRows ?? []).length;

  if (completedCount < lessonIds.length) {
    return {
      ok: false,
      error: "Complete all lessons to unlock your certificate.",
    } as const;
  }

  const certificateNumber = `CERT-${courseId.slice(0, 8).toUpperCase()}-${randomUUID().slice(0, 8).toUpperCase()}`;

  const { data: createdCertificate, error: createError } = await supabase
    .from("course_certificates")
    .insert({
      user_id: userId,
      course_id: courseId,
      certificate_number: certificateNumber,
    })
    .select("id, certificate_number, issued_at")
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  return {
    ok: true,
    certificate: createdCertificate,
  } as const;
}

export async function summarizeProgressByCourse(
  supabase: ServerSupabaseClient,
  userId: string,
  courseIds: string[],
): Promise<Record<string, CourseProgressSummary>> {
  if (courseIds.length === 0) {
    return {};
  }

  const uniqueCourseIds = Array.from(new Set(courseIds));

  const { data: modules, error: modulesError } = await supabase
    .from("course_modules")
    .select("id, course_id")
    .in("course_id", uniqueCourseIds)
    .eq("published", true);

  if (modulesError) {
    throw new Error(modulesError.message);
  }

  const moduleRows = modules ?? [];
  const moduleIds = moduleRows.map((moduleRow) => moduleRow.id);

  const { data: lessons, error: lessonsError } = moduleIds.length
    ? await supabase
        .from("module_lessons")
        .select("id, module_id")
        .in("module_id", moduleIds)
        .eq("published", true)
    : { data: [], error: null };

  if (lessonsError) {
    throw new Error(lessonsError.message);
  }

  const lessonRows = lessons ?? [];
  const lessonIds = lessonRows.map((lesson) => lesson.id);

  const { data: completedRows, error: completedError } = lessonIds.length
    ? await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", userId)
        .eq("completed", true)
        .in("lesson_id", lessonIds)
    : { data: [], error: null };

  if (completedError) {
    throw new Error(completedError.message);
  }

  const completedSet = new Set(
    (completedRows ?? []).map((row) => row.lesson_id),
  );

  const moduleById = new Map(
    moduleRows.map((moduleRow) => [moduleRow.id, moduleRow.course_id]),
  );

  const totalByCourse = new Map<string, number>();
  const completedByCourse = new Map<string, number>();

  for (const lesson of lessonRows) {
    const courseId = moduleById.get(lesson.module_id);

    if (!courseId) {
      continue;
    }

    totalByCourse.set(courseId, (totalByCourse.get(courseId) ?? 0) + 1);

    if (completedSet.has(lesson.id)) {
      completedByCourse.set(
        courseId,
        (completedByCourse.get(courseId) ?? 0) + 1,
      );
    }
  }

  const result: Record<string, CourseProgressSummary> = {};

  for (const courseId of uniqueCourseIds) {
    const totalLessons = totalByCourse.get(courseId) ?? 0;
    const completedLessons = completedByCourse.get(courseId) ?? 0;

    result[courseId] = {
      totalLessons,
      completedLessons,
      progressPercent: toProgressPercent(completedLessons, totalLessons),
    };
  }

  return result;
}
