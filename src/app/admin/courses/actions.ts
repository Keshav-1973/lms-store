"use server";

import { requireAdminUser } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CourseFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

type CourseModuleInput = {
  title: string;
  description: string;
};

type InitialLessonInput = {
  lessonTitle: string;
  lessonDescription: string;
  lessonType: "video" | "pdf" | "both";
  lessonDurationSeconds: number;
  lessonPosition: number;
  lessonVideoFile: File | null;
  lessonPdfFile: File | null;
};

type InitialModuleInput = {
  moduleTitle: string;
  moduleDescription: string;
  modulePosition: number;
  lessons: InitialLessonInput[];
};

type LessonContentType = "video" | "pdf" | "both";

const LMS_ASSETS_BUCKET = process.env.SUPABASE_LMS_BUCKET ?? "lms-assets";

function parseNumberField(value: FormDataEntryValue | null, fallback = 0) {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseIntegerField(value: FormDataEntryValue | null, fallback = 0) {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseLineListField(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [] as string[];
  }

  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseModulesField(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [] as CourseModuleInput[];
  }

  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...descriptionParts] = line.split("|");
      return {
        title: title?.trim() ?? "",
        description: descriptionParts.join("|").trim(),
      };
    })
    .filter((module) => module.title.length > 0);
}

function sanitizeFileName(fileName: string) {
  const normalized = fileName.trim().toLowerCase().replace(/\s+/g, "-");
  return normalized.replace(/[^a-z0-9._-]/g, "");
}

function readStringEntries(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => (typeof value === "string" ? value.trim() : ""));
}

function parseStructuredModuleSummaries(
  formData: FormData,
): CourseModuleInput[] {
  const moduleTitles = readStringEntries(formData, "module_titles");
  const moduleDescriptions = readStringEntries(formData, "module_descriptions");

  return moduleTitles
    .map((title, idx) => ({
      title,
      description: moduleDescriptions[idx] ?? "",
    }))
    .filter((moduleRow) => moduleRow.title.length > 0);
}

function toLessonContentType(rawType: string | undefined): LessonContentType {
  const normalized = (rawType ?? "video").toLowerCase();
  if (normalized === "pdf") return "pdf";
  if (normalized === "both") return "both";
  return "video";
}

function throwIfSupabaseError(
  error: { message: string } | null,
  fallbackMessage: string,
) {
  if (error) {
    throw new Error(error.message || fallbackMessage);
  }
}

function parseInitialModuleLessonInputs(
  formData: FormData,
): InitialModuleInput[] {
  const moduleTitles = readStringEntries(formData, "module_titles");
  const moduleDescriptions = readStringEntries(formData, "module_descriptions");
  const modulePositions = readStringEntries(formData, "module_positions");

  const lessonTitles = readStringEntries(formData, "lesson_titles");
  const lessonDescriptions = readStringEntries(formData, "lesson_descriptions");
  const lessonTypes = readStringEntries(formData, "lesson_types");
  const lessonDurations = readStringEntries(formData, "lesson_durations");
  const lessonPositions = readStringEntries(formData, "lesson_positions");
  const lessonModuleIndices = readStringEntries(
    formData,
    "lesson_module_indices",
  );
  const lessonVideoFiles = formData.getAll("lesson_files_video");
  const lessonPdfFiles = formData.getAll("lesson_files_pdf");

  const modules: InitialModuleInput[] = moduleTitles.map((title, idx) => ({
    moduleTitle: title,
    moduleDescription: moduleDescriptions[idx] ?? "",
    modulePosition: parseIntegerField(modulePositions[idx] ?? null, idx),
    lessons: [] as InitialLessonInput[],
  }));

  for (let i = 0; i < lessonTitles.length; i += 1) {
    const moduleIndex = parseIntegerField(lessonModuleIndices[i] ?? null, 0);
    const target = modules[moduleIndex];

    if (!target) continue;

    const lessonType = toLessonContentType(lessonTypes[i]);

    const videoFileEntry = lessonVideoFiles[i];
    const pdfFileEntry = lessonPdfFiles[i];
    const lessonVideoFile =
      videoFileEntry instanceof File && videoFileEntry.size > 0
        ? videoFileEntry
        : null;
    const lessonPdfFile =
      pdfFileEntry instanceof File && pdfFileEntry.size > 0
        ? pdfFileEntry
        : null;

    const lessonTitle = lessonTitles[i] ?? "";
    const lessonDescription = lessonDescriptions[i] ?? "";
    const lessonDurationSeconds = parseIntegerField(
      lessonDurations[i] ?? null,
      0,
    );
    const hasAnyLessonContent =
      lessonTitle.trim().length > 0 ||
      lessonDescription.trim().length > 0 ||
      lessonDurationSeconds > 0 ||
      Boolean(lessonVideoFile) ||
      Boolean(lessonPdfFile);

    if (!hasAnyLessonContent) {
      continue;
    }

    target.lessons.push({
      lessonTitle,
      lessonDescription,
      lessonType,
      lessonDurationSeconds,
      lessonPosition: parseIntegerField(lessonPositions[i] ?? null, i),
      lessonVideoFile,
      lessonPdfFile,
    });
  }

  return modules.filter((m) => m.moduleTitle.length > 0);
}

async function uploadLessonFile(
  adminClient: SupabaseClient,
  courseSlug: string,
  modulePosition: number,
  lessonType: "video" | "pdf",
  file: File,
) {
  const safeName = sanitizeFileName(file.name || "lesson-file");
  const path = `${courseSlug}/module-${modulePosition + 1}/${Date.now()}-${safeName}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await adminClient.storage
    .from(LMS_ASSETS_BUCKET)
    .upload(path, bytes, {
      contentType:
        file.type || (lessonType === "video" ? "video/mp4" : "application/pdf"),
      upsert: false,
    });

  if (uploadError) {
    throw new Error(
      `Failed to upload lesson file to bucket "${LMS_ASSETS_BUCKET}": ${uploadError.message}`,
    );
  }

  const { data } = adminClient.storage
    .from(LMS_ASSETS_BUCKET)
    .getPublicUrl(path);

  if (!data.publicUrl) {
    throw new Error(
      "Failed to generate a public URL for uploaded lesson file.",
    );
  }

  return data.publicUrl;
}

function ensureLessonMediaForType(
  _lessonType: LessonContentType,
  videoUrl: string | null,
  pdfUrl: string | null,
  _lessonTitle: string,
) {
  // Admins can draft/publish courses without uploading lesson media files.
  // Keep this hook to support future stricter validation toggles if needed.
  void [videoUrl, pdfUrl];
}

function normalizeCoursePayload(formData: FormData) {
  return {
    slug: (formData.get("slug") as string)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-"),
    name: (formData.get("name") as string).trim(),
    tagline: (formData.get("tagline") as string).trim(),
    description: (formData.get("description") as string).trim(),
    description_detailed: (
      formData.get("description_detailed") as string
    ).trim(),
    price: parseNumberField(formData.get("price")),
    compare_at_price: parseNumberField(formData.get("compare_at_price")),
    category: (formData.get("category") as string).trim(),
    accent: ((formData.get("accent") as string | null) ?? "").trim(),
    rating: parseNumberField(formData.get("rating")),
    review_count: parseIntegerField(formData.get("review_count")),
    downloads: (formData.get("downloads") as string).trim(),
    modules: parseModulesField(formData.get("modules")),
    included: parseLineListField(formData.get("included")),
    outcomes: parseLineListField(formData.get("outcomes")),
    published: formData.get("published") === "true",
  };
}

function validateCoursePayload(
  raw: ReturnType<typeof normalizeCoursePayload>,
  formData: FormData,
  initialModules: InitialModuleInput[],
) {
  const fieldErrors: Record<string, string> = {};

  if (!raw.name) {
    fieldErrors.name = "Course name is required.";
  }

  if (!raw.slug) {
    fieldErrors.slug = "Slug is required.";
  }

  if (!Number.isFinite(raw.price) || raw.price < 0) {
    fieldErrors.price = "Price must be 0 or greater.";
  }

  if (!Number.isFinite(raw.compare_at_price) || raw.compare_at_price < 0) {
    fieldErrors.compare_at_price = "Compare-at price must be 0 or greater.";
  }

  if (!Number.isFinite(raw.rating) || raw.rating < 0 || raw.rating > 5) {
    fieldErrors.rating = "Rating must be between 0 and 5.";
  }

  if (!Number.isInteger(raw.review_count) || raw.review_count < 0) {
    fieldErrors.review_count = "Review count must be a whole number >= 0.";
  }

  if (!raw.downloads) {
    fieldErrors.downloads = "Downloads is required (example: 4.2K+).";
  }

  if (raw.modules.length === 0 && initialModules.length === 0) {
    // modules are managed via course_modules table on the edit page
  }

  const modulesText = (formData.get("modules") as string | null) ?? "";
  const invalidModuleLine = modulesText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .find((line) => {
      const [title, ...descriptionParts] = line.split("|");
      return !title?.trim() || !descriptionParts.join("|").trim();
    });

  if (invalidModuleLine && initialModules.length === 0) {
    fieldErrors.modules =
      "Each module line must be: Module Title | Module description.";
  }

  const invalidLesson = initialModules
    .flatMap((m) => m.lessons)
    .find((l) => !l.lessonTitle);

  if (invalidLesson) {
    fieldErrors.modules = "Each lesson must have a title.";
  }

  if (raw.included.length === 0) {
    fieldErrors.included = "Add at least one included item.";
  }

  if (raw.outcomes.length === 0) {
    fieldErrors.outcomes = "Add at least one outcome.";
  }

  return fieldErrors;
}

async function requireAdmin() {
  const auth = await requireAdminUser();

  if (!auth.ok) {
    return { error: auth.error as "Unauthorized." | "Forbidden." };
  }

  return { supabase: auth.supabase };
}

async function syncModulesAndLessons(
  adminClient: SupabaseClient,
  courseId: string,
  courseSlug: string,
  formData: FormData,
) {
  const moduleTitles = readStringEntries(formData, "module_titles");
  const moduleDescriptions = readStringEntries(formData, "module_descriptions");
  const modulePositions = readStringEntries(formData, "module_positions");
  const moduleDbIds = readStringEntries(formData, "module_db_ids");

  const lessonTitles = readStringEntries(formData, "lesson_titles");
  const lessonDescriptions = readStringEntries(formData, "lesson_descriptions");
  const lessonTypes = readStringEntries(formData, "lesson_types");
  const lessonDurations = readStringEntries(formData, "lesson_durations");
  const lessonPositions = readStringEntries(formData, "lesson_positions");
  const lessonModuleIndices = readStringEntries(
    formData,
    "lesson_module_indices",
  );
  const lessonDbIds = readStringEntries(formData, "lesson_db_ids");
  const lessonExistingVideoUrls = readStringEntries(
    formData,
    "lesson_existing_video_urls",
  );
  const lessonExistingPdfUrls = readStringEntries(
    formData,
    "lesson_existing_pdf_urls",
  );
  const lessonVideoFiles = formData.getAll("lesson_files_video");
  const lessonPdfFiles = formData.getAll("lesson_files_pdf");

  // 1. Delete modules that were removed from the form.
  const { data: currentModules, error: currentModulesError } = await adminClient
    .from("course_modules")
    .select("id")
    .eq("course_id", courseId);
  throwIfSupabaseError(currentModulesError, "Failed to load existing modules.");

  const submittedModuleDbIds = new Set(moduleDbIds.filter(Boolean));
  const toDeleteModuleIds = (currentModules ?? [])
    .map((m) => m.id as string)
    .filter((id) => !submittedModuleDbIds.has(id));

  if (toDeleteModuleIds.length > 0) {
    const { error: deleteModulesError } = await adminClient
      .from("course_modules")
      .delete()
      .in("id", toDeleteModuleIds);
    throwIfSupabaseError(
      deleteModulesError,
      "Failed to delete removed modules.",
    );
  }

  // 2. Upsert modules; build formIndex → DB id mapping for lessons.
  const moduleIdByFormIndex = new Map<number, string>();

  for (let i = 0; i < moduleTitles.length; i += 1) {
    const title = moduleTitles[i] ?? "";
    if (!title) continue;

    const dbId = moduleDbIds[i] ?? "";
    const position = parseIntegerField(modulePositions[i] ?? null, i);
    const description = moduleDescriptions[i] ?? "";

    if (dbId) {
      const { error: updateModuleError } = await adminClient
        .from("course_modules")
        .update({ title, description, position })
        .eq("id", dbId);
      throwIfSupabaseError(updateModuleError, "Failed to update module.");
      moduleIdByFormIndex.set(i, dbId);
    } else {
      const { data: newMod, error: modErr } = await adminClient
        .from("course_modules")
        .insert({
          course_id: courseId,
          title,
          description,
          position,
          published: true,
        })
        .select("id")
        .single();
      if (modErr || !newMod)
        throw new Error(modErr?.message ?? "Failed to create module.");
      moduleIdByFormIndex.set(i, newMod.id);
    }
  }

  // 3. Delete lessons that were removed from the form.
  const allModuleIds = [...moduleIdByFormIndex.values()];
  const { data: currentLessons, error: currentLessonsError } =
    allModuleIds.length
      ? await adminClient
          .from("module_lessons")
          .select("id")
          .in("module_id", allModuleIds)
      : { data: [], error: null };
  throwIfSupabaseError(currentLessonsError, "Failed to load existing lessons.");

  const submittedLessonDbIds = new Set(lessonDbIds.filter(Boolean));
  const toDeleteLessonIds = (currentLessons ?? [])
    .map((l) => l.id as string)
    .filter((id) => !submittedLessonDbIds.has(id));

  if (toDeleteLessonIds.length > 0) {
    const { error: deleteLessonsError } = await adminClient
      .from("module_lessons")
      .delete()
      .in("id", toDeleteLessonIds);
    throwIfSupabaseError(
      deleteLessonsError,
      "Failed to delete removed lessons.",
    );
  }

  // 4. Upsert lessons.
  for (let i = 0; i < lessonTitles.length; i += 1) {
    const title = lessonTitles[i] ?? "";
    if (!title) continue;

    const moduleFormIndex = parseIntegerField(
      lessonModuleIndices[i] ?? null,
      0,
    );
    const moduleDbId = moduleIdByFormIndex.get(moduleFormIndex);
    if (!moduleDbId) continue;

    const lessonType = toLessonContentType(lessonTypes[i]);

    const videoFileEntry = lessonVideoFiles[i];
    const pdfFileEntry = lessonPdfFiles[i];
    const newVideoFile =
      videoFileEntry instanceof File && videoFileEntry.size > 0
        ? videoFileEntry
        : null;
    const newPdfFile =
      pdfFileEntry instanceof File && pdfFileEntry.size > 0
        ? pdfFileEntry
        : null;

    let videoUrl: string | null = lessonExistingVideoUrls[i] || null;
    let pdfUrl: string | null = lessonExistingPdfUrls[i] || null;

    if (newVideoFile) {
      videoUrl = await uploadLessonFile(
        adminClient,
        courseSlug,
        moduleFormIndex,
        "video",
        newVideoFile,
      );
    }
    if (newPdfFile) {
      pdfUrl = await uploadLessonFile(
        adminClient,
        courseSlug,
        moduleFormIndex,
        "pdf",
        newPdfFile,
      );
    }

    ensureLessonMediaForType(lessonType, videoUrl, pdfUrl, title);

    const lessonPayload = {
      module_id: moduleDbId,
      title,
      description: lessonDescriptions[i] ?? "",
      content_type: lessonType,
      video_url:
        lessonType === "video" || lessonType === "both" ? videoUrl : null,
      pdf_url: lessonType === "pdf" || lessonType === "both" ? pdfUrl : null,
      duration_seconds: Math.max(
        0,
        parseIntegerField(lessonDurations[i] ?? null, 0),
      ),
      position: parseIntegerField(lessonPositions[i] ?? null, i),
      published: true,
    };

    const lessonDbId = lessonDbIds[i] ?? "";
    if (lessonDbId) {
      const { error: updateLessonError } = await adminClient
        .from("module_lessons")
        .update(lessonPayload)
        .eq("id", lessonDbId);
      throwIfSupabaseError(updateLessonError, "Failed to update lesson.");
    } else {
      const { error: insertLessonError } = await adminClient
        .from("module_lessons")
        .insert(lessonPayload);
      throwIfSupabaseError(insertLessonError, "Failed to create lesson.");
    }
  }
}

export async function createCourse(
  _prev: CourseFormState,
  formData: FormData,
): Promise<CourseFormState> {
  const context = await requireAdmin();

  if ("error" in context) {
    return { error: context.error };
  }

  const { supabase } = context;

  const raw = normalizeCoursePayload(formData);
  const initialModules = parseInitialModuleLessonInputs(formData);

  if (initialModules.length > 0) {
    raw.modules = initialModules.map((m) => ({
      title: m.moduleTitle,
      description: m.moduleDescription,
    }));
  }

  const fieldErrors = validateCoursePayload(raw, formData, initialModules);

  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const { data: createdCourse, error } = await supabase
    .from("courses")
    .insert(raw)
    .select("id, slug")
    .single();

  if (error || !createdCourse) {
    return { error: error?.message ?? "Failed to create course." };
  }

  if (initialModules.length > 0) {
    const adminClient = createAdminClient();

    try {
      for (const moduleDraft of initialModules) {
        const { data: createdModule, error: moduleError } = await adminClient
          .from("course_modules")
          .insert({
            course_id: createdCourse.id,
            title: moduleDraft.moduleTitle,
            description: moduleDraft.moduleDescription,
            position: moduleDraft.modulePosition,
            published: true,
          })
          .select("id")
          .single();

        if (moduleError || !createdModule) {
          throw new Error(moduleError?.message ?? "Failed to create module.");
        }

        for (const lessonDraft of moduleDraft.lessons) {
          const videoUrl = lessonDraft.lessonVideoFile
            ? await uploadLessonFile(
                adminClient,
                createdCourse.slug,
                moduleDraft.modulePosition,
                "video",
                lessonDraft.lessonVideoFile,
              )
            : null;

          const pdfUrl = lessonDraft.lessonPdfFile
            ? await uploadLessonFile(
                adminClient,
                createdCourse.slug,
                moduleDraft.modulePosition,
                "pdf",
                lessonDraft.lessonPdfFile,
              )
            : null;

          ensureLessonMediaForType(
            lessonDraft.lessonType,
            videoUrl,
            pdfUrl,
            lessonDraft.lessonTitle,
          );

          const { error: lessonError } = await adminClient
            .from("module_lessons")
            .insert({
              module_id: createdModule.id,
              title: lessonDraft.lessonTitle,
              description: lessonDraft.lessonDescription,
              content_type: lessonDraft.lessonType,
              video_url: videoUrl,
              pdf_url: pdfUrl,
              duration_seconds: Math.max(0, lessonDraft.lessonDurationSeconds),
              position: lessonDraft.lessonPosition,
              published: true,
            });

          if (lessonError) {
            throw new Error(lessonError.message);
          }
        }
      }
    } catch (moduleSetupError) {
      await adminClient.from("courses").delete().eq("id", createdCourse.id);

      return {
        error:
          moduleSetupError instanceof Error
            ? moduleSetupError.message
            : "Failed to create initial modules and lesson files.",
      };
    }
  }

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  const createSuccessParams = new URLSearchParams({
    success: "created",
    course: raw.name,
  });
  redirect(`/admin/courses?${createSuccessParams.toString()}`);
}

export async function updateCourse(
  courseId: string,
  _prev: CourseFormState,
  formData: FormData,
): Promise<CourseFormState> {
  const context = await requireAdmin();

  if ("error" in context) {
    return { error: context.error };
  }

  const { supabase } = context;
  const raw = normalizeCoursePayload(formData);
  const structuredModules = parseStructuredModuleSummaries(formData);
  const updatePayload: Partial<ReturnType<typeof normalizeCoursePayload>> = {
    ...raw,
  };

  if (structuredModules.length > 0) {
    updatePayload.modules = structuredModules;
  } else if (!formData.has("modules")) {
    delete updatePayload.modules;
  }

  const fieldErrors = validateCoursePayload(raw, formData, []);

  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const { error } = await supabase
    .from("courses")
    .update(updatePayload)
    .eq("id", courseId);

  if (error) {
    return { error: error.message };
  }

  try {
    const adminClient = createAdminClient();
    await syncModulesAndLessons(adminClient, courseId, raw.slug, formData);
  } catch (syncError) {
    return {
      error:
        syncError instanceof Error
          ? syncError.message
          : "Failed to sync course content.",
    };
  }

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  revalidatePath(`/courses/${raw.slug}`);
  revalidatePath("/student");
  const updateSuccessParams = new URLSearchParams({
    success: "updated",
    course: raw.name,
  });
  redirect(`/admin/courses?${updateSuccessParams.toString()}`);
}

export async function toggleCoursePublished(
  courseId: string,
  nextPublished: boolean,
) {
  const context = await requireAdmin();

  if ("error" in context) {
    throw new Error(context.error);
  }

  const { supabase } = context;
  await supabase
    .from("courses")
    .update({ published: nextPublished })
    .eq("id", courseId);

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
}

export async function deleteCourse(id: string) {
  const context = await requireAdmin();

  if ("error" in context) {
    throw new Error(context.error);
  }

  const { supabase } = context;
  await supabase.from("courses").delete().eq("id", id);
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
}
