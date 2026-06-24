"use client";

import { ConfirmPopup } from "@/components/confirm-popup";
import { FileUploadField } from "@/components/file-upload-field";
import { BookOpen, FileText, PlayCircle, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createLesson,
  createModule,
  createResource,
  deleteLesson,
  deleteModule,
  deleteResource,
  updateLesson,
  updateModule,
  updateResource,
} from "./actions";

type Module = {
  id: string;
  title: string;
  description: string;
  position: number;
  published: boolean;
  lessons: Lesson[];
};

type Lesson = {
  id: string;
  title: string;
  description: string;
  content_type: "video" | "pdf" | "both";
  video_url: string | null;
  pdf_url: string | null;
  duration_seconds: number;
  position: number;
  published: boolean;
  resources: {
    id: string;
    lesson_id: string;
    type: "video" | "pdf" | "document";
    title: string;
    description: string;
    url: string;
    position: number;
    published: boolean;
  }[];
};

type CourseContentFormProps = {
  courseId: string;
  courseSlug: string;
  modules: Module[];
};

async function handleAction(
  action: (formData: FormData) => Promise<void>,
  formData: FormData,
  successMessage: string,
) {
  try {
    await action(formData);
    toast.success(successMessage);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    toast.error(message);
  }
}

export function CourseContentForm({
  courseId,
  courseSlug,
  modules,
}: CourseContentFormProps) {
  const [isPending, startTransition] = useTransition();
  const [contentType, setContentType] = useState("video");
  const [addLessonUrls, setAddLessonUrls] = useState<
    Record<string, { video: string; pdf: string }>
  >({});
  const [editLessonUrls, setEditLessonUrls] = useState<
    Record<string, { video: string; pdf: string }>
  >({});
  const [editLessonContentType, setEditLessonContentType] = useState<
    Record<string, string>
  >({});
  const [newResourceUrls, setNewResourceUrls] = useState<
    Record<string, string>
  >({});
  const [editingResourceUrls, setEditingResourceUrls] = useState<
    Record<string, string>
  >({});
  const [showAddResourceForm, setShowAddResourceForm] = useState<
    Record<string, boolean>
  >({});
  const [confirmForm, setConfirmForm] = useState<HTMLFormElement | null>(null);
  const [confirmPopup, setConfirmPopup] = useState({
    open: false,
    title: "",
    description: "",
  });

  const openDeleteConfirm = (
    form: HTMLFormElement | null,
    title: string,
    description: string,
  ) => {
    if (!form) {
      return;
    }

    setConfirmForm(form);
    setConfirmPopup({
      open: true,
      title,
      description,
    });
  };

  const closeDeleteConfirm = () => {
    setConfirmPopup((prev) => ({ ...prev, open: false }));
    setConfirmForm(null);
  };

  const confirmDelete = () => {
    const form = confirmForm;
    setConfirmPopup((prev) => ({ ...prev, open: false }));
    setConfirmForm(null);
    form?.requestSubmit();
  };

  const handleCreateModule = (formData: FormData) => {
    startTransition(() =>
      handleAction(createModule, formData, "Module created successfully!"),
    );
  };

  const handleUpdateModule = (formData: FormData) => {
    startTransition(() =>
      handleAction(updateModule, formData, "Module updated successfully!"),
    );
  };

  const handleDeleteModule = (formData: FormData) => {
    startTransition(() =>
      handleAction(deleteModule, formData, "Module deleted successfully!"),
    );
  };

  const handleCreateLesson = (formData: FormData) => {
    const moduleId = formData.get("module_id") as string;
    if (!formData.get("title")) {
      toast.error("Lesson title is required.");
      return;
    }

    const videoUrl = addLessonUrls[moduleId]?.video || "";
    const pdfUrl = addLessonUrls[moduleId]?.pdf || "";

    if (videoUrl) formData.set("video_url", videoUrl);
    if (pdfUrl) formData.set("pdf_url", pdfUrl);

    startTransition(() => {
      handleAction(createLesson, formData, "Lesson created successfully!").then(
        () => {
          setAddLessonUrls((prev) => {
            const newUrls = { ...prev };
            delete newUrls[moduleId];
            return newUrls;
          });
          setContentType("video");
        },
      );
    });
  };

  const handleUpdateLesson = (formData: FormData) => {
    const lessonId = formData.get("lesson_id") as string;
    if (!formData.get("title")) {
      toast.error("Lesson title is required.");
      return;
    }

    // Prefer newly-uploaded URL from state, then fall back to the existing
    // DB value carried via hidden fields — this prevents clearing a saved URL
    // when the admin saves without re-uploading.
    const existingVideoUrl =
      (formData.get("existing_video_url") as string) || "";
    const existingPdfUrl = (formData.get("existing_pdf_url") as string) || "";
    const videoUrl = editLessonUrls[lessonId]?.video || existingVideoUrl;
    const pdfUrl = editLessonUrls[lessonId]?.pdf || existingPdfUrl;

    if (videoUrl) formData.set("video_url", videoUrl);
    if (pdfUrl) formData.set("pdf_url", pdfUrl);

    startTransition(() =>
      handleAction(updateLesson, formData, "Lesson updated successfully!"),
    );
  };

  const handleDeleteLesson = (formData: FormData) => {
    startTransition(() =>
      handleAction(deleteLesson, formData, "Lesson deleted successfully!"),
    );
  };

  const handleCreateResource = (formData: FormData) => {
    const lessonId = formData.get("lesson_id") as string;
    const resourceUrl = newResourceUrls[lessonId] || "";

    if (!resourceUrl) {
      toast.error("Resource URL is required.");
      return;
    }

    formData.set("url", resourceUrl);
    startTransition(() => {
      handleAction(
        createResource,
        formData,
        "Resource added successfully!",
      ).then(() => {
        setNewResourceUrls((prev) => {
          const newUrls = { ...prev };
          delete newUrls[lessonId];
          return newUrls;
        });
        setShowAddResourceForm((prev) => ({ ...prev, [lessonId]: false }));
      });
    });
  };

  const handleUpdateResource = (formData: FormData) => {
    const resourceId = formData.get("resource_id") as string;
    const resourceUrl = editingResourceUrls[resourceId] || "";

    if (!resourceUrl) {
      toast.error("Resource URL is required.");
      return;
    }

    formData.set("url", resourceUrl);
    startTransition(() =>
      handleAction(updateResource, formData, "Resource updated successfully!"),
    );
  };

  const handleDeleteResource = (formData: FormData) => {
    startTransition(() =>
      handleAction(deleteResource, formData, "Resource deleted successfully!"),
    );
  };

  return (
    <div className="space-y-5">
      {/* Add Module Section */}
      <section className="mb-7 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-400">
          Add Module
        </h2>
        <form
          action={handleCreateModule}
          className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
        >
          <input type="hidden" name="course_id" value={courseId} />
          <input type="hidden" name="course_slug" value={courseSlug} />
          <input
            name="title"
            required
            placeholder="Module title"
            className="min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            name="description"
            placeholder="Module description"
            className="min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            name="position"
            type="number"
            min={0}
            placeholder="Position"
            className="min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">
            <input name="published" type="checkbox" defaultChecked />
            <span>Published</span>
          </label>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 sm:col-span-2 lg:col-span-1"
          >
            <Plus className="h-4 w-4" />
            {isPending ? "Adding..." : "Add Module"}
          </button>
        </form>
      </section>

      {/* Modules List */}
      {modules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
          Create your first module to begin building this course.
        </div>
      ) : null}

      {modules.map((module) => (
        <section
          key={module.id}
          className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          {/* Module Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="inline-flex min-w-0 items-center gap-2 text-lg font-semibold text-slate-900">
              <BookOpen className="h-5 w-5 text-slate-500" />
              <span className="wrap-break-word">{module.title}</span>
            </h2>
            <form action={handleDeleteModule} className="w-full sm:w-auto">
              <input type="hidden" name="module_id" value={module.id} />
              <input type="hidden" name="course_id" value={courseId} />
              <input type="hidden" name="course_slug" value={courseSlug} />
              <button
                type="button"
                onClick={(event) =>
                  openDeleteConfirm(
                    event.currentTarget.form,
                    "Delete module?",
                    `Delete "${module.title}" and all lessons inside it? This cannot be undone.`,
                  )
                }
                disabled={isPending}
                className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 sm:w-auto"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Module
              </button>
            </form>
          </div>

          {/* Update Module Form */}
          <form
            action={handleUpdateModule}
            className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
          >
            <input type="hidden" name="module_id" value={module.id} />
            <input type="hidden" name="course_id" value={courseId} />
            <input type="hidden" name="course_slug" value={courseSlug} />
            <input
              name="title"
              required
              defaultValue={module.title}
              className="min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              name="description"
              defaultValue={module.description}
              className="min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              name="position"
              type="number"
              min={0}
              defaultValue={module.position}
              className="min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">
              <input
                name="published"
                type="checkbox"
                defaultChecked={module.published}
              />
              <span>Published</span>
            </label>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 sm:col-span-2 lg:col-span-1"
            >
              {isPending ? "Saving..." : "Update Module"}
            </button>
          </form>

          {/* Lessons Section */}
          <div className="mt-5 space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">Lessons</h3>

            {module.lessons.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-4 text-sm text-slate-500">
                No lessons yet in this module.
              </p>
            ) : null}

            {/* Existing Lessons */}
            {module.lessons.map((lesson) => {
              const lessonContentType =
                editLessonContentType[lesson.id] || lesson.content_type;
              return (
                <div
                  key={lesson.id}
                  className="rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-700">
                      {lesson.content_type === "video" ? (
                        <PlayCircle className="h-4 w-4 text-cyan-600" />
                      ) : lesson.content_type === "both" ? (
                        <>
                          <PlayCircle className="h-4 w-4 text-cyan-600" />
                          <FileText className="h-4 w-4 text-amber-600" />
                        </>
                      ) : (
                        <FileText className="h-4 w-4 text-amber-600" />
                      )}
                      <span className="wrap-break-word">{lesson.title}</span>
                    </p>
                    <form
                      action={handleDeleteLesson}
                      className="w-full sm:w-auto"
                    >
                      <input type="hidden" name="lesson_id" value={lesson.id} />
                      <input type="hidden" name="course_id" value={courseId} />
                      <input
                        type="hidden"
                        name="course_slug"
                        value={courseSlug}
                      />
                      <button
                        type="button"
                        onClick={(event) =>
                          openDeleteConfirm(
                            event.currentTarget.form,
                            "Delete lesson?",
                            `Delete lesson "${lesson.title}"? This action cannot be undone.`,
                          )
                        }
                        disabled={isPending}
                        className="w-full rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 sm:w-auto sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:hover:bg-transparent sm:hover:text-red-700"
                      >
                        Delete
                      </button>
                    </form>
                  </div>

                  {/* Update Lesson Form */}
                  <form action={handleUpdateLesson} className="space-y-3">
                    <input type="hidden" name="lesson_id" value={lesson.id} />
                    <input type="hidden" name="course_id" value={courseId} />
                    <input
                      type="hidden"
                      name="course_slug"
                      value={courseSlug}
                    />
                    {/* Preserve existing URLs so a Save without re-uploading doesn't clear them */}
                    <input
                      type="hidden"
                      name="existing_video_url"
                      value={lesson.video_url || ""}
                    />
                    <input
                      type="hidden"
                      name="existing_pdf_url"
                      value={lesson.pdf_url || ""}
                    />

                    <div className="grid gap-2 md:grid-cols-3">
                      <input
                        name="title"
                        required
                        defaultValue={lesson.title}
                        placeholder="Lesson title"
                        className="min-w-0 rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                      />
                      <select
                        name="content_type"
                        defaultValue={lesson.content_type}
                        onChange={(e) =>
                          setEditLessonContentType((prev) => ({
                            ...prev,
                            [lesson.id]: e.target.value,
                          }))
                        }
                        className="min-w-0 rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                      >
                        <option value="video">Video</option>
                        <option value="pdf">PDF</option>
                        <option value="both">Video + PDF</option>
                      </select>
                      <input
                        name="duration_seconds"
                        type="number"
                        min={0}
                        defaultValue={lesson.duration_seconds}
                        placeholder="Duration (seconds)"
                        className="min-w-0 rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                      />
                    </div>

                    {/* File Upload Fields */}
                    {(lessonContentType === "video" ||
                      lessonContentType === "both") && (
                      <FileUploadField
                        type="video"
                        value={
                          editLessonUrls[lesson.id]?.video ||
                          lesson.video_url ||
                          ""
                        }
                        onChange={(url) => {
                          setEditLessonUrls((prev) => ({
                            ...prev,
                            [lesson.id]: { ...prev[lesson.id], video: url },
                          }));
                        }}
                        disabled={isPending}
                      />
                    )}
                    {(lessonContentType === "pdf" ||
                      lessonContentType === "both") && (
                      <FileUploadField
                        type="pdf"
                        value={
                          editLessonUrls[lesson.id]?.pdf || lesson.pdf_url || ""
                        }
                        onChange={(url) => {
                          setEditLessonUrls((prev) => ({
                            ...prev,
                            [lesson.id]: { ...prev[lesson.id], pdf: url },
                          }));
                        }}
                        disabled={isPending}
                      />
                    )}

                    <div className="grid gap-2 md:grid-cols-3">
                      <input
                        name="position"
                        type="number"
                        min={0}
                        defaultValue={lesson.position}
                        placeholder="Position"
                        className="min-w-0 rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                      />
                      <input
                        name="description"
                        defaultValue={lesson.description}
                        placeholder="Description"
                        className="min-w-0 rounded-lg border border-slate-200 px-2.5 py-2 text-sm md:col-span-2"
                      />
                    </div>

                    <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-600">
                        <input
                          name="published"
                          type="checkbox"
                          defaultChecked={lesson.published}
                        />
                        <span>Published</span>
                      </label>
                      <button
                        type="submit"
                        disabled={isPending}
                        className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 sm:min-w-28"
                      >
                        {isPending ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </form>

                  {/* Resources Section */}
                  <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Resources
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setShowAddResourceForm((prev) => ({
                            ...prev,
                            [lesson.id]: !prev[lesson.id],
                          }))
                        }
                        disabled={isPending}
                        className="inline-flex w-full items-center justify-center gap-1 rounded px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50 sm:w-auto"
                      >
                        <Plus className="h-3 w-3" />
                        Add Resource
                      </button>
                    </div>

                    {/* Existing Resources */}
                    {lesson.resources.length === 0 ? (
                      <p className="rounded border border-dashed border-slate-300 bg-white px-2 py-2 text-xs text-slate-500">
                        No resources yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {lesson.resources.map((resource) => (
                          <div
                            key={resource.id}
                            className="flex flex-col gap-2 rounded bg-white p-2 text-xs sm:flex-row sm:items-start"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-700">
                                <span className="wrap-break-word">
                                  {resource.title}
                                </span>
                              </p>
                              <p className="wrap-break-word text-slate-500">
                                {resource.type}
                              </p>
                            </div>
                            <div className="flex w-full gap-1 sm:w-auto">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingResourceUrls((prev) => ({
                                    ...prev,
                                    [resource.id]: resource.url,
                                  }));
                                }}
                                className="flex-1 rounded px-2 py-1 text-slate-600 hover:bg-blue-100 hover:text-blue-700 sm:flex-none"
                              >
                                Edit
                              </button>
                              <form
                                action={handleDeleteResource}
                                className="inline"
                              >
                                <input
                                  type="hidden"
                                  name="resource_id"
                                  value={resource.id}
                                />
                                <input
                                  type="hidden"
                                  name="course_id"
                                  value={courseId}
                                />
                                <input
                                  type="hidden"
                                  name="course_slug"
                                  value={courseSlug}
                                />
                                <button
                                  type="button"
                                  onClick={(event) =>
                                    openDeleteConfirm(
                                      event.currentTarget.form,
                                      "Delete resource?",
                                      `Delete resource "${resource.title}"? This action cannot be undone.`,
                                    )
                                  }
                                  disabled={isPending}
                                  className="flex-1 rounded px-2 py-1 text-red-600 hover:bg-red-100 hover:text-red-700 disabled:opacity-50 sm:flex-none"
                                >
                                  Delete
                                </button>
                              </form>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Resource Form */}
                    {showAddResourceForm[lesson.id] && (
                      <form
                        action={handleCreateResource}
                        className="mt-2 rounded border border-dashed border-slate-300 bg-white p-2"
                      >
                        <input
                          type="hidden"
                          name="lesson_id"
                          value={lesson.id}
                        />
                        <input
                          type="hidden"
                          name="course_id"
                          value={courseId}
                        />
                        <input
                          type="hidden"
                          name="course_slug"
                          value={courseSlug}
                        />

                        <div className="grid gap-2 md:grid-cols-2">
                          <input
                            name="title"
                            required
                            placeholder="Resource title"
                            className="min-w-0 rounded border border-slate-200 px-2 py-1 text-xs"
                          />
                          <select
                            name="type"
                            className="min-w-0 rounded border border-slate-200 px-2 py-1 text-xs"
                          >
                            <option value="video">Video</option>
                            <option value="pdf">PDF</option>
                            <option value="document">Document</option>
                          </select>
                          <input
                            name="description"
                            placeholder="Description (optional)"
                            className="min-w-0 rounded border border-slate-200 px-2 py-1 text-xs md:col-span-2"
                          />
                          <input
                            name="position"
                            type="number"
                            min={0}
                            placeholder="Position"
                            className="min-w-0 rounded border border-slate-200 px-2 py-1 text-xs"
                          />
                          <label className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-xs text-slate-600">
                            <input
                              name="published"
                              type="checkbox"
                              defaultChecked
                            />
                            <span>Published</span>
                          </label>
                        </div>

                        <div className="mt-2">
                          <FileUploadField
                            type="document"
                            value={newResourceUrls[lesson.id] || ""}
                            onChange={(url) => {
                              setNewResourceUrls((prev) => ({
                                ...prev,
                                [lesson.id]: url,
                              }));
                            }}
                            disabled={isPending}
                          />
                        </div>

                        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                          <button
                            type="submit"
                            disabled={isPending}
                            className="rounded bg-slate-900 px-2 py-1 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
                          >
                            {isPending ? "Saving..." : "Add Resource"}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setShowAddResourceForm((prev) => ({
                                ...prev,
                                [lesson.id]: false,
                              }))
                            }
                            className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add Lesson Form */}
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-3">
              <p className="mb-2 text-sm font-semibold text-slate-700">
                Add Lesson
              </p>
              <form action={handleCreateLesson} className="space-y-3">
                <input type="hidden" name="module_id" value={module.id} />
                <input type="hidden" name="course_id" value={courseId} />
                <input type="hidden" name="course_slug" value={courseSlug} />

                <div className="grid gap-2 md:grid-cols-3">
                  <input
                    name="title"
                    required
                    placeholder="Lesson title"
                    className="min-w-0 rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                  />
                  <select
                    name="content_type"
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="min-w-0 rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                  >
                    <option value="video">Video</option>
                    <option value="pdf">PDF</option>
                    <option value="both">Video + PDF</option>
                  </select>
                  <input
                    name="duration_seconds"
                    type="number"
                    min={0}
                    placeholder="Duration (seconds)"
                    className="min-w-0 rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                  />
                </div>

                {/* File Upload Fields */}
                {(contentType === "video" || contentType === "both") && (
                  <FileUploadField
                    type="video"
                    value={addLessonUrls[module.id]?.video || ""}
                    onChange={(url) => {
                      setAddLessonUrls((prev) => ({
                        ...prev,
                        [module.id]: { ...prev[module.id], video: url },
                      }));
                    }}
                    disabled={isPending}
                  />
                )}
                {(contentType === "pdf" || contentType === "both") && (
                  <FileUploadField
                    type="pdf"
                    value={addLessonUrls[module.id]?.pdf || ""}
                    onChange={(url) => {
                      setAddLessonUrls((prev) => ({
                        ...prev,
                        [module.id]: { ...prev[module.id], pdf: url },
                      }));
                    }}
                    disabled={isPending}
                  />
                )}

                <div className="grid gap-2 md:grid-cols-3">
                  <input
                    name="position"
                    type="number"
                    min={0}
                    placeholder="Position"
                    className="min-w-0 rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                  />
                  <input
                    name="description"
                    placeholder="Description"
                    className="min-w-0 rounded-lg border border-slate-200 px-2.5 py-2 text-sm md:col-span-2"
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-600">
                    <input name="published" type="checkbox" defaultChecked />
                    <span>Published</span>
                  </label>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 sm:w-auto"
                  >
                    <Plus className="h-4 w-4" />
                    {isPending ? "Adding..." : "Add Lesson"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      ))}

      <ConfirmPopup
        open={confirmPopup.open}
        title={confirmPopup.title}
        description={confirmPopup.description}
        icon={<Trash2 className="h-5 w-5 text-red-500" />}
        cancelLabel="Cancel"
        confirmLabel="Delete"
        onCancel={closeDeleteConfirm}
        onConfirm={confirmDelete}
        isLoading={isPending}
      />
    </div>
  );
}
