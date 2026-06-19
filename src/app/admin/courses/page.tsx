import { createClient } from "@/lib/supabase/server";
import { BookOpen, Pencil, Plus, Rocket } from "lucide-react";
import Link from "next/link";
import { toggleCoursePublished } from "./actions";
import { AdminCoursesSuccessToast } from "./admin-courses-success-toast";
import { DeleteCourseButton } from "./delete-course-button";

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, slug, name, category, price, published, created_at")
    .order("created_at", { ascending: false });

  const count = courses?.length ?? 0;
  const suffix = count === 1 ? "" : "s";

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
      <AdminCoursesSuccessToast />

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Courses</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {count} course{suffix} in the catalogue
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          <Plus className="h-4 w-4" />
          Add Course
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error.message}
        </div>
      )}

      {!courses || courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <BookOpen className="mb-3 h-8 w-8 text-slate-300" />
          <p className="font-medium text-slate-500">No courses yet.</p>
          <Link
            href="/admin/courses/new"
            className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Add your first course
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="divide-y divide-slate-100 md:hidden">
            {courses.map((course) => (
              <article key={course.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {course.name}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {course.slug}
                    </p>
                  </div>
                  {course.published ? (
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Published
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                      Draft
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <p className="text-slate-600">{course.category}</p>
                  <p className="font-medium text-slate-900">${course.price}</p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/admin/courses/${course.id}/edit`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Link>

                  <form
                    action={async () => {
                      "use server";
                      await toggleCoursePublished(course.id, !course.published);
                    }}
                  >
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1.5 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-100"
                    >
                      <Rocket className="h-3.5 w-3.5" />
                      {course.published ? "Unpublish" : "Publish"}
                    </button>
                  </form>

                  <DeleteCourseButton
                    courseId={course.id}
                    courseName={course.name}
                  />
                </div>
              </article>
            ))}
          </div>

          <table className="hidden w-full text-sm md:table">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-5 py-3.5 font-semibold text-slate-500">
                  Course
                </th>
                <th className="px-5 py-3.5 font-semibold text-slate-500">
                  Category
                </th>
                <th className="px-5 py-3.5 font-semibold text-slate-500">
                  Price
                </th>
                <th className="px-5 py-3.5 font-semibold text-slate-500">
                  Status
                </th>
                <th className="px-5 py-3.5 text-right font-semibold text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {courses.map((course) => (
                <tr key={course.id} className="group hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">
                      {course.name}
                    </p>
                    <p className="text-xs text-slate-400">{course.slug}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {course.category}
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-900">
                    ${course.price}
                  </td>
                  <td className="px-5 py-4">
                    {course.published ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        Published
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/courses/${course.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>

                      <form
                        action={async () => {
                          "use server";
                          await toggleCoursePublished(
                            course.id,
                            !course.published,
                          );
                        }}
                      >
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1.5 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-100"
                        >
                          <Rocket className="h-3.5 w-3.5" />
                          {course.published ? "Unpublish" : "Publish"}
                        </button>
                      </form>

                      <DeleteCourseButton
                        courseId={course.id}
                        courseName={course.name}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
