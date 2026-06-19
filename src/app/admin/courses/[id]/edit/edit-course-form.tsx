"use client";

import { ArrowLeft, FileText, PlayCircle, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { type CourseFormState, updateCourse } from "../../actions";

type FieldErrors = Record<string, string | undefined>;

const CATEGORIES = [
  "Data Science",
  "Web Development",
  "AI / ML",
  "Design",
  "Business",
  "Marketing",
  "Other",
];

const ACCENT_PRESETS = [
  { label: "Indigo", value: "from-indigo-50 to-indigo-100", color: "#6366f1" },
  { label: "Cyan", value: "from-cyan-50 to-cyan-100", color: "#06b6d4" },
  { label: "Rose", value: "from-rose-50 to-rose-100", color: "#f43f5e" },
  { label: "Amber", value: "from-amber-50 to-amber-100", color: "#f59e0b" },
  {
    label: "Emerald",
    value: "from-emerald-50 to-emerald-100",
    color: "#10b981",
  },
  { label: "Violet", value: "from-violet-50 to-violet-100", color: "#8b5cf6" },
];

type EditableCourse = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  description_detailed: string;
  price: number;
  compare_at_price: number;
  category: string;
  accent: string;
  rating: number;
  review_count: number;
  downloads: string;
  modules: Array<{ title: string; description: string }>;
  included: string[];
  outcomes: string[];
  published: boolean;
};

const initialState: CourseFormState = {};

type DraftLesson = {
  id: string;
  existingId: string | null;
  title: string;
  description: string;
  type: "video" | "pdf" | "both";
  durationSeconds: string;
  existingVideoUrl: string | null;
  existingPdfUrl: string | null;
};

type DraftModule = {
  id: string;
  existingId: string | null;
  title: string;
  description: string;
  lessons: DraftLesson[];
};

type ExistingLesson = {
  id: string;
  title: string;
  description: string;
  content_type: string;
  video_url: string | null;
  pdf_url: string | null;
  duration_seconds: number;
};

type ExistingModule = {
  id: string;
  title: string;
  description: string;
  lessons: ExistingLesson[];
};

function newLesson(): DraftLesson {
  return {
    id: crypto.randomUUID(),
    existingId: null,
    title: "",
    description: "",
    type: "video",
    durationSeconds: "",
    existingVideoUrl: null,
    existingPdfUrl: null,
  };
}

function initDraftModules(existingModules: ExistingModule[]): DraftModule[] {
  if (existingModules.length === 0) {
    return [
      {
        id: crypto.randomUUID(),
        existingId: null,
        title: "",
        description: "",
        lessons: [newLesson()],
      },
    ];
  }

  return existingModules.map((m) => ({
    id: crypto.randomUUID(),
    existingId: m.id,
    title: m.title,
    description: m.description,
    lessons:
      m.lessons.length > 0
        ? m.lessons.map((l) => ({
            id: crypto.randomUUID(),
            existingId: l.id,
            title: l.title,
            description: l.description,
            type: (l.content_type as "video" | "pdf" | "both") ?? "video",
            durationSeconds: String(l.duration_seconds),
            existingVideoUrl: l.video_url,
            existingPdfUrl: l.pdf_url,
          }))
        : [newLesson()],
  }));
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function validateModuleLines(_trimmed: string) {
  return undefined;
}

const FIELD_VALIDATORS: Record<
  string,
  (trimmed: string) => string | undefined
> = {
  name: (trimmed) => (trimmed ? undefined : "Course name is required."),
  slug: (trimmed) => (trimmed ? undefined : "Slug is required."),
  price: (trimmed) => {
    const parsed = Number.parseFloat(trimmed);
    return !Number.isFinite(parsed) || parsed < 0
      ? "Price must be 0 or greater."
      : undefined;
  },
  compare_at_price: (trimmed) => {
    const parsed = Number.parseFloat(trimmed);
    return trimmed && (!Number.isFinite(parsed) || parsed < 0)
      ? "Compare-at price must be 0 or greater."
      : undefined;
  },
  rating: (trimmed) => {
    const parsed = Number.parseFloat(trimmed);
    return trimmed && (!Number.isFinite(parsed) || parsed < 0 || parsed > 5)
      ? "Rating must be between 0 and 5."
      : undefined;
  },
  review_count: (trimmed) => {
    const parsed = Number.parseInt(trimmed, 10);
    return trimmed && (!Number.isInteger(parsed) || parsed < 0)
      ? "Review count must be a whole number >= 0."
      : undefined;
  },
  downloads: (trimmed) =>
    trimmed ? undefined : "Downloads is required (example: 4.2K+).",
  included: (trimmed) =>
    trimmed.length > 0 ? undefined : "Add at least one included item.",
  outcomes: (trimmed) =>
    trimmed.length > 0 ? undefined : "Add at least one outcome.",
  modules: validateModuleLines,
};

function validateFieldValue(name: string, value: string) {
  const trimmed = value.trim();
  const validator = FIELD_VALIDATORS[name];
  return validator ? validator(trimmed) : undefined;
}

export default function EditCourseForm({
  course,
  existingModules,
}: {
  course: EditableCourse;
  existingModules: ExistingModule[];
}) {
  const [name, setName] = useState(course.name);
  const [slug, setSlug] = useState(course.slug);
  const [slugEdited, setSlugEdited] = useState(false);
  const [selectedAccent, setSelectedAccent] = useState(course.accent);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [dirtyFields, setDirtyFields] = useState<Record<string, boolean>>({});
  const [draftModules, setDraftModules] = useState<DraftModule[]>(() =>
    initDraftModules(existingModules),
  );
  const includedText = useMemo(
    () => (course.included ?? []).join("\n"),
    [course.included],
  );
  const outcomesText = useMemo(
    () => (course.outcomes ?? []).join("\n"),
    [course.outcomes],
  );

  const action = useMemo(() => updateCourse.bind(null, course.id), [course.id]);
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error]);

  const getFieldError = (name: string) => {
    if (dirtyFields[name]) {
      return clientErrors[name];
    }

    return state.fieldErrors?.[name] ?? clientErrors[name];
  };

  const validateAndSetField = (name: string, value: string) => {
    setDirtyFields((prev) => ({ ...prev, [name]: true }));
    setClientErrors((prev) => ({
      ...prev,
      [name]: validateFieldValue(name, value),
    }));
  };

  const handleNameChange = (value: string) => {
    setName(value);
    validateAndSetField("name", value);
    if (!slugEdited || slug.length === 0) {
      const nextSlug = slugify(value);
      setSlug(nextSlug);
      validateAndSetField("slug", nextSlug);
    }
  };

  const handleSlugChange = (value: string) => {
    const next = slugify(value);
    setSlug(next);
    setSlugEdited(next.length > 0);
    validateAndSetField("slug", next);
  };

  const addDraftModule = () => {
    setDraftModules((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        existingId: null,
        title: "",
        description: "",
        lessons: [newLesson()],
      },
    ]);
  };

  const removeDraftModule = (id: string) => {
    setDraftModules((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((m) => m.id !== id);
    });
  };

  const updateDraftModuleField = (
    moduleId: string,
    field: "title" | "description",
    value: string,
  ) => {
    setDraftModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, [field]: value } : m)),
    );
  };

  const addLesson = (moduleId: string) => {
    setDraftModules((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson()] } : m,
      ),
    );
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    setDraftModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId) return m;
        if (m.lessons.length === 1) return m;
        return { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) };
      }),
    );
  };

  const updateLesson = (
    moduleId: string,
    lessonId: string,
    field: keyof Omit<
      DraftLesson,
      "id" | "existingId" | "existingVideoUrl" | "existingPdfUrl"
    >,
    value: string,
  ) => {
    setDraftModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId) return m;
        return {
          ...m,
          lessons: m.lessons.map((l) =>
            l.id === lessonId ? { ...l, [field]: value } : l,
          ),
        };
      }),
    );
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8">
      <Link
        href="/admin/courses"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Courses
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-slate-900">Edit Course</h1>

      {state.error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}

      <form action={formAction} className="space-y-6">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">
            Basic Info
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Course Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(event) => handleNameChange(event.target.value)}
                className={`w-full rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
                  getFieldError("name")
                    ? "border border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200"
                    : "border border-slate-200 bg-slate-50 focus:border-slate-400 focus:ring-slate-900/10"
                }`}
              />
              {getFieldError("name") ? (
                <p className="mt-1 text-xs text-red-600">
                  {getFieldError("name")}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="slug"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                URL Slug <span className="text-red-500">*</span>
              </label>
              <input
                id="slug"
                name="slug"
                type="text"
                required
                value={slug}
                onChange={(event) => handleSlugChange(event.target.value)}
                className={`w-full rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
                  getFieldError("slug")
                    ? "border border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200"
                    : "border border-slate-200 bg-slate-50 focus:border-slate-400 focus:ring-slate-900/10"
                }`}
              />
              {getFieldError("slug") ? (
                <p className="mt-1 text-xs text-red-600">
                  {getFieldError("slug")}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-slate-400">
                Auto-generated from course name. You can still edit it.
              </p>
            </div>

            <Field
              label="Tagline"
              name="tagline"
              defaultValue={course.tagline}
              error={getFieldError("tagline")}
              onValueChange={(value) => validateAndSetField("tagline", value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="category"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  defaultValue={course.category}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="published"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Status
                </label>
                <select
                  id="published"
                  name="published"
                  defaultValue={course.published ? "true" : "false"}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:bg-white"
                >
                  <option value="true">Published</option>
                  <option value="false">Draft</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">
            Description
          </h2>

          <div className="space-y-4">
            <TextareaField
              label="Short Description"
              name="description"
              rows={3}
              defaultValue={course.description}
            />
            <TextareaField
              label="Detailed Description"
              name="description_detailed"
              rows={5}
              defaultValue={course.description_detailed}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">
            Pricing
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Price (USD)"
              name="price"
              type="number"
              required
              defaultValue={course.price.toString()}
              error={getFieldError("price")}
              onValueChange={(value) => validateAndSetField("price", value)}
            />
            <Field
              label="Compare-at Price (USD)"
              name="compare_at_price"
              type="number"
              defaultValue={course.compare_at_price.toString()}
              error={getFieldError("compare_at_price")}
              onValueChange={(value) =>
                validateAndSetField("compare_at_price", value)
              }
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">
            Stats
          </h2>

          <div className="grid grid-cols-3 gap-4">
            <Field
              label="Rating"
              name="rating"
              type="number"
              defaultValue={course.rating.toString()}
              error={getFieldError("rating")}
              onValueChange={(value) => validateAndSetField("rating", value)}
            />
            <Field
              label="Review Count"
              name="review_count"
              type="number"
              defaultValue={course.review_count.toString()}
              error={getFieldError("review_count")}
              onValueChange={(value) =>
                validateAndSetField("review_count", value)
              }
            />
            <Field
              label="Downloads"
              name="downloads"
              defaultValue={course.downloads}
              error={getFieldError("downloads")}
              onValueChange={(value) => validateAndSetField("downloads", value)}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">
            Accent Colour
          </h2>
          <div className="flex flex-wrap gap-3">
            {ACCENT_PRESETS.map((preset) => (
              <label
                key={preset.value}
                className="group flex cursor-pointer flex-col items-center gap-1.5"
              >
                <input
                  type="radio"
                  name="accent"
                  value={preset.value}
                  checked={selectedAccent === preset.value}
                  onChange={() => setSelectedAccent(preset.value)}
                  className="sr-only"
                />
                <span
                  className={`h-8 w-8 rounded-full border-2 transition ${
                    selectedAccent === preset.value
                      ? "border-white ring-2 ring-slate-900"
                      : "border-transparent ring-2 ring-transparent group-hover:ring-slate-300"
                  }`}
                  style={{ background: preset.color }}
                />
                <span
                  className={`text-xs ${
                    selectedAccent === preset.value
                      ? "font-semibold text-slate-900"
                      : "text-slate-500"
                  }`}
                >
                  {preset.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">
            Curriculum & Lists
          </h2>

          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">
                  Modules with Lesson Files
                </p>
                <button
                  type="button"
                  onClick={addDraftModule}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Module
                </button>
              </div>

              {state.fieldErrors?.modules ? (
                <p className="mb-2 text-xs text-red-600">
                  {state.fieldErrors.modules}
                </p>
              ) : null}

              <div className="space-y-3">
                {draftModules.map((module, moduleIndex) => (
                  <div
                    key={module.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Module {moduleIndex + 1}
                        {module.existingId ? (
                          <span className="ml-1.5 font-normal normal-case text-slate-400">
                            (existing)
                          </span>
                        ) : null}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeDraftModule(module.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove Module
                      </button>
                    </div>

                    <div className="grid gap-2 md:grid-cols-2">
                      <input
                        name="module_titles"
                        required
                        value={module.title}
                        onChange={(event) =>
                          updateDraftModuleField(
                            module.id,
                            "title",
                            event.target.value,
                          )
                        }
                        placeholder="Module title"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                      />
                      <input
                        name="module_descriptions"
                        value={module.description}
                        onChange={(event) =>
                          updateDraftModuleField(
                            module.id,
                            "description",
                            event.target.value,
                          )
                        }
                        placeholder="Module description"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                      />
                    </div>
                    <input
                      type="hidden"
                      name="module_positions"
                      value={moduleIndex}
                    />
                    <input
                      type="hidden"
                      name="module_db_ids"
                      value={module.existingId ?? ""}
                    />

                    <div className="mt-3 space-y-2">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="rounded-lg border border-slate-100 bg-white p-2.5"
                        >
                          <div className="mb-1.5 flex items-center justify-between">
                            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                              {lesson.existingId ? (
                                lesson.type === "video" ? (
                                  <PlayCircle className="h-3.5 w-3.5 text-cyan-500" />
                                ) : lesson.type === "both" ? (
                                  <>
                                    <PlayCircle className="h-3.5 w-3.5 text-cyan-500" />
                                    <FileText className="h-3.5 w-3.5 text-amber-500" />
                                  </>
                                ) : (
                                  <FileText className="h-3.5 w-3.5 text-amber-500" />
                                )
                              ) : null}
                              Lesson {lessonIndex + 1}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeLesson(module.id, lesson.id)}
                              className="text-xs font-semibold text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="grid gap-2 md:grid-cols-3">
                            <input
                              name="lesson_titles"
                              required
                              value={lesson.title}
                              onChange={(event) =>
                                updateLesson(
                                  module.id,
                                  lesson.id,
                                  "title",
                                  event.target.value,
                                )
                              }
                              placeholder="Lesson title"
                              className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                            />
                            <select
                              name="lesson_types"
                              value={lesson.type}
                              onChange={(event) =>
                                updateLesson(
                                  module.id,
                                  lesson.id,
                                  "type",
                                  event.target.value,
                                )
                              }
                              className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                            >
                              <option value="video">Video</option>
                              <option value="pdf">PDF</option>
                              <option value="both">Video + PDF</option>
                            </select>
                            <input
                              name="lesson_durations"
                              type="number"
                              min={0}
                              value={lesson.durationSeconds}
                              onChange={(event) =>
                                updateLesson(
                                  module.id,
                                  lesson.id,
                                  "durationSeconds",
                                  event.target.value,
                                )
                              }
                              placeholder="Duration (seconds)"
                              className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                            />
                          </div>

                          {(lesson.type === "video" ||
                            lesson.type === "both") && (
                            <label className="mt-2 block">
                              <span className="mb-1 block text-xs font-medium text-slate-500">
                                Upload Video
                                {lesson.existingVideoUrl &&
                                  " (leave empty to keep current)"}
                              </span>
                              <input
                                name="lesson_files_video"
                                type="file"
                                accept="video/*"
                                className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                              />
                            </label>
                          )}

                          {(lesson.type === "pdf" ||
                            lesson.type === "both") && (
                            <label className="mt-2 block">
                              <span className="mb-1 block text-xs font-medium text-slate-500">
                                Upload PDF
                                {lesson.existingPdfUrl
                                  ? " (leave empty to keep current)"
                                  : ""}
                              </span>
                              <input
                                name="lesson_files_pdf"
                                type="file"
                                accept="application/pdf"
                                className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                              />
                            </label>
                          )}

                          <textarea
                            name="lesson_descriptions"
                            rows={2}
                            value={lesson.description}
                            onChange={(event) =>
                              updateLesson(
                                module.id,
                                lesson.id,
                                "description",
                                event.target.value,
                              )
                            }
                            placeholder="Lesson description (optional)"
                            className="mt-2 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                          />

                          <input
                            type="hidden"
                            name="lesson_module_indices"
                            value={moduleIndex}
                          />
                          <input
                            type="hidden"
                            name="lesson_positions"
                            value={lessonIndex}
                          />
                          <input
                            type="hidden"
                            name="lesson_db_ids"
                            value={lesson.existingId ?? ""}
                          />
                          <input
                            type="hidden"
                            name="lesson_existing_video_urls"
                            value={lesson.existingVideoUrl ?? ""}
                          />
                          <input
                            type="hidden"
                            name="lesson_existing_pdf_urls"
                            value={lesson.existingPdfUrl ?? ""}
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => addLesson(module.id)}
                      className="mt-2 inline-flex items-center gap-1 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Lesson
                    </button>
                  </div>
                ))}
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Each module can have multiple video and PDF lessons. Changes
                save when you click Save Changes.
              </p>
            </div>
            <TextareaField
              label="Included"
              name="included"
              rows={6}
              defaultValue={includedText}
              error={getFieldError("included")}
              onValueChange={(value) => validateAndSetField("included", value)}
            />
            <TextareaField
              label="Outcomes"
              name="outcomes"
              rows={6}
              defaultValue={outcomesText}
              error={getFieldError("outcomes")}
              onValueChange={(value) => validateAndSetField("outcomes", value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/courses"
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  error,
  onValueChange,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  error?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        onChange={(event) => onValueChange?.(event.target.value)}
        min={type === "number" ? 0 : undefined}
        step={type === "number" ? "0.01" : undefined}
        className={`w-full rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
          error
            ? "border border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200"
            : "border border-slate-200 bg-slate-50 focus:border-slate-400 focus:ring-slate-900/10"
        }`}
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function TextareaField({
  label,
  name,
  rows,
  defaultValue,
  error,
  onValueChange,
}: {
  label: string;
  name: string;
  rows: number;
  defaultValue?: string;
  error?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        onChange={(event) => onValueChange?.(event.target.value)}
        className={`w-full resize-none rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
          error
            ? "border border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200"
            : "border border-slate-200 bg-slate-50 focus:border-slate-400 focus:ring-slate-900/10"
        }`}
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
