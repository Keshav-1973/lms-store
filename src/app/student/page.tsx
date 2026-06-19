import { summarizeProgressByCourse } from "@/features/lms/lms-service";
import { createClient } from "@/lib/supabase/server";
import { BookOpen, GraduationCap } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

type EnrollmentRow = {
  id: string;
  enrolled_at: string;
  courses:
    | {
        id: string;
        slug: string;
        name: string;
        category: string;
        price: number;
      }
    | Array<{
        id: string;
        slug: string;
        name: string;
        category: string;
        price: number;
      }>;
};

export default async function StudentDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/student");
  }

  const { data: enrollments, error } = await supabase
    .from("enrollments")
    .select(
      "id, enrolled_at, courses(id, slug, name, category, price, compare_at_price)",
    )
    .eq("user_id", user.id)
    .order("enrolled_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error.message}
        </div>
      </main>
    );
  }

  const rows = (enrollments ?? []) as EnrollmentRow[];
  const courseIds = rows
    .map((row) => {
      const course = Array.isArray(row.courses) ? row.courses[0] : row.courses;
      return course?.id;
    })
    .filter((courseId): courseId is string => Boolean(courseId));

  const progressByCourseId = await summarizeProgressByCourse(
    supabase,
    user.id,
    courseIds,
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
      <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-sm sm:p-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
          Student Dashboard
        </p>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          My Enrolled Courses
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Track all courses you have enrolled in from one place.
        </p>

        {rows.length === 0 ? (
          <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center">
            <BookOpen
              className="mx-auto h-7 w-7 text-slate-400"
              aria-hidden="true"
            />
            <p className="mt-2 text-sm text-slate-600">
              You have not enrolled in any courses yet.
            </p>
            <Link
              href="/courses"
              className="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {rows.map((enrollment) => {
              const course = Array.isArray(enrollment.courses)
                ? enrollment.courses[0]
                : enrollment.courses;

              if (!course) {
                return null;
              }

              return (
                <article
                  key={enrollment.id}
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                    {course.category}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    {course.name}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Enrolled on{" "}
                    {new Date(enrollment.enrolled_at).toLocaleDateString()}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-slate-900">
                        {progressByCourseId[course.id]?.progressPercent ?? 0}%
                      </span>
                      <p className="text-xs text-slate-500">Progress</p>
                    </div>
                    <Link
                      href={`/student/courses/${course.slug}`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Continue Learning
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
