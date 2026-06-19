import { listCourseContentForAdmin } from "@/features/lms/lms-service";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  PlayCircle,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  createLesson,
  createModule,
  deleteLesson,
  deleteModule,
  updateLesson,
  updateModule,
} from "./actions";

type CourseContentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CourseContentPage({
  params,
}: CourseContentPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course, error } = await supabase
    .from("courses")
    .select("id, slug, name")
    .eq("id", id)
    .single();

  if (error || !course) {
    notFound();
  }

  const modules = await listCourseContentForAdmin(supabase, course.id);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/courses"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            {course.name} Content
          </h1>
          <p className="text-sm text-slate-500">
            Manage modules and lessons for this course.
          </p>
        </div>
        <Link
          href={`/student/courses/${course.slug}`}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Preview Learning Page
        </Link>
      </div>

      <section className="mb-7 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-400">
          Add Module
        </h2>
        <form
          action={createModule}
          className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
        >
          <input type="hidden" name="course_id" value={course.id} />
          <input type="hidden" name="course_slug" value={course.slug} />
          <input
            name="title"
            required
            placeholder="Module title"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            name="description"
            placeholder="Module description"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            name="position"
            type="number"
            min={0}
            defaultValue={modules.length}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">
            <input name="published" type="checkbox" defaultChecked />
            <span>Published</span>
          </label>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <Plus className="h-4 w-4" />
            Add Module
          </button>
        </form>
      </section>

      <div className="space-y-5">
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
            <div className="flex items-center justify-between gap-3">
              <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
                <BookOpen className="h-5 w-5 text-slate-500" />
                {module.title}
              </h2>
              <form action={deleteModule}>
                <input type="hidden" name="module_id" value={module.id} />
                <input type="hidden" name="course_id" value={course.id} />
                <input type="hidden" name="course_slug" value={course.slug} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Module
                </button>
              </form>
            </div>

            <form
              action={updateModule}
              className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
            >
              <input type="hidden" name="module_id" value={module.id} />
              <input type="hidden" name="course_id" value={course.id} />
              <input type="hidden" name="course_slug" value={course.slug} />
              <input
                name="title"
                required
                defaultValue={module.title}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                name="description"
                defaultValue={module.description}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                name="position"
                type="number"
                min={0}
                defaultValue={module.position}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Update Module
              </button>
            </form>

            <div className="mt-5 space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-700">Lessons</h3>

              {module.lessons.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-4 text-sm text-slate-500">
                  No lessons yet in this module.
                </p>
              ) : null}

              {module.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
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
                      {lesson.title}
                    </p>
                    <form action={deleteLesson}>
                      <input type="hidden" name="lesson_id" value={lesson.id} />
                      <input type="hidden" name="course_id" value={course.id} />
                      <input
                        type="hidden"
                        name="course_slug"
                        value={course.slug}
                      />
                      <button
                        type="submit"
                        className="text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </form>
                  </div>

                  <form
                    action={updateLesson}
                    className="grid gap-2 md:grid-cols-6"
                  >
                    <input type="hidden" name="lesson_id" value={lesson.id} />
                    <input type="hidden" name="course_id" value={course.id} />
                    <input
                      type="hidden"
                      name="course_slug"
                      value={course.slug}
                    />
                    <input
                      name="title"
                      required
                      defaultValue={lesson.title}
                      className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm md:col-span-2"
                    />
                    <select
                      name="content_type"
                      defaultValue={lesson.content_type}
                      className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                    >
                      <option value="video">Video</option>
                      <option value="pdf">PDF</option>{" "}
                      <option value="both">Video + PDF</option>{" "}
                      <option value="both">Video + PDF</option>
                    </select>
                    <input
                      name="video_url"
                      defaultValue={lesson.video_url ?? ""}
                      placeholder="Video URL"
                      className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                    />
                    <input
                      name="pdf_url"
                      defaultValue={lesson.pdf_url ?? ""}
                      placeholder="PDF URL"
                      className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                    />
                    <input
                      name="duration_seconds"
                      type="number"
                      min={0}
                      defaultValue={lesson.duration_seconds}
                      className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                    />
                    <input
                      name="position"
                      type="number"
                      min={0}
                      defaultValue={lesson.position}
                      className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                    />
                    <input
                      name="description"
                      defaultValue={lesson.description}
                      placeholder="Description"
                      className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm md:col-span-2"
                    />
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
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Save
                    </button>
                  </form>
                </div>
              ))}

              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-3">
                <p className="mb-2 text-sm font-semibold text-slate-700">
                  Add Lesson
                </p>
                <form
                  action={createLesson}
                  className="grid gap-2 md:grid-cols-6"
                >
                  <input type="hidden" name="module_id" value={module.id} />
                  <input type="hidden" name="course_id" value={course.id} />
                  <input type="hidden" name="course_slug" value={course.slug} />
                  <input
                    name="title"
                    required
                    placeholder="Lesson title"
                    className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm md:col-span-2"
                  />
                  <select
                    name="content_type"
                    defaultValue="video"
                    className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                  >
                    <option value="video">Video</option>
                    <option value="pdf">PDF</option>
                  </select>
                  <input
                    name="video_url"
                    placeholder="Video URL"
                    className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                  />
                  <input
                    name="pdf_url"
                    placeholder="PDF URL"
                    className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                  />
                  <input
                    name="duration_seconds"
                    type="number"
                    min={0}
                    defaultValue={0}
                    className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                  />
                  <input
                    name="position"
                    type="number"
                    min={0}
                    defaultValue={module.lessons.length}
                    className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
                  />
                  <input
                    name="description"
                    placeholder="Description"
                    className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm md:col-span-2"
                  />
                  <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-600">
                    <input name="published" type="checkbox" defaultChecked />
                    <span>Published</span>
                  </label>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add Lesson
                  </button>
                </form>
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
