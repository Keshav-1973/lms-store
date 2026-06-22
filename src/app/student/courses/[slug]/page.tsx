import { getStudentCourseLearningData } from "@/features/lms/lms-service";
import { createClient } from "@/lib/supabase/server";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Circle,
  FileText,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { generateCertificate, updateLessonProgress } from "./actions";

type StudentCoursePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatDuration(durationSeconds: number) {
  const minutes = Math.ceil(durationSeconds / 60);

  if (minutes <= 0) {
    return "Self-paced";
  }

  return `${minutes} min`;
}

function renderLessonTypeIcon(contentType: "video" | "pdf" | "both") {
  if (contentType === "video") {
    return <PlayCircle className="h-4 w-4 text-cyan-600" />;
  }

  if (contentType === "both") {
    return (
      <>
        <PlayCircle className="h-4 w-4 text-cyan-600" />
        <FileText className="h-4 w-4 text-amber-600" />
      </>
    );
  }

  return <FileText className="h-4 w-4 text-amber-600" />;
}

export default async function StudentCoursePage({
  params,
}: StudentCoursePageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/student/courses/${slug}`);
  }

  const learningData = await getStudentCourseLearningData(
    supabase,
    user.id,
    slug,
  );

  if (!learningData) {
    return (
      <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          You are not enrolled in this course yet. Purchase the course first to
          start learning.
        </div>
        <Link
          href="/courses"
          className="mt-4 inline-flex rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Browse Courses
        </Link>
      </main>
    );
  }

  const hasLessons = learningData.totalLessons > 0;
  const isComplete =
    hasLessons && learningData.completedLessons >= learningData.totalLessons;

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          My Learning
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          {learningData.course.name}
        </h1>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
            <span>Course progress</span>
            <span className="font-semibold text-slate-900">
              {learningData.progressPercent}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-slate-900"
              style={{ width: `${learningData.progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {learningData.completedLessons} of {learningData.totalLessons}{" "}
            lessons completed
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {learningData.certificate ? (
            <Link
              href={`/student/courses/${learningData.course.slug}/certificate`}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Award className="h-4 w-4" />
              View Certificate
            </Link>
          ) : (
            <form action={generateCertificate}>
              <input
                type="hidden"
                name="course_id"
                value={learningData.course.id}
              />
              <input
                type="hidden"
                name="course_slug"
                value={learningData.course.slug}
              />
              <button
                type="submit"
                disabled={!isComplete}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Award className="h-4 w-4" />
                Generate Certificate
              </button>
            </form>
          )}

          <Link
            href="/student"
            className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Back to Dashboard
          </Link>
        </div>
      </section>

      <section className="mt-6 space-y-4">
        {learningData.modules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            This course has no published modules yet.
          </div>
        ) : null}

        {learningData.modules.map((module, moduleIndex) => (
          <article
            key={module.id}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
              Module {moduleIndex + 1}
            </p>
            <h2 className="mt-1 inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
              <BookOpen className="h-5 w-5 text-slate-500" />
              {module.title}
            </h2>
            {module.description ? (
              <p className="mt-1 text-sm text-slate-500">
                {module.description}
              </p>
            ) : null}

            <div className="mt-4 space-y-2">
              {module.lessons.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                  No published lessons in this module yet.
                </p>
              ) : null}

              {module.lessons.map((lesson, lessonIndex) => (
                <div
                  key={lesson.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                        {renderLessonTypeIcon(lesson.content_type)}
                        Lesson {lessonIndex + 1}: {lesson.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDuration(lesson.duration_seconds)}
                      </p>
                      {!lesson.video_url && !lesson.pdf_url && (
                        <p className="mt-1 inline-flex rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                          Content Coming Soon
                        </p>
                      )}
                    </div>

                    <form action={updateLessonProgress}>
                      <input type="hidden" name="lesson_id" value={lesson.id} />
                      <input
                        type="hidden"
                        name="course_slug"
                        value={learningData.course.slug}
                      />
                      <input
                        type="hidden"
                        name="completed"
                        value={lesson.completed ? "false" : "true"}
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        {lesson.completed ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            Mark Incomplete
                          </>
                        ) : (
                          <>
                            <Circle className="h-4 w-4 text-slate-400" />
                            Mark Complete
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {lesson.description ? (
                    <p className="mt-2 text-sm text-slate-600">
                      {lesson.description}
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/student/courses/${learningData.course.slug}/lessons/${lesson.id}`}
                      className="inline-flex rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
                    >
                      Open Lesson
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
