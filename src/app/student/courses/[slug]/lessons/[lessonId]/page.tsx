import { LessonPlayer } from "@/components/lesson-player";
import { getStudentCourseLearningData } from "@/features/lms/lms-service";
import { createClient } from "@/lib/supabase/server";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

type LessonPageProps = {
  params: Promise<{
    slug: string;
    lessonId: string;
  }>;
};

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug, lessonId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/student/courses/${slug}/lessons/${lessonId}`);
  }

  const learningData = await getStudentCourseLearningData(
    supabase,
    user.id,
    slug,
  );

  if (!learningData) {
    return (
      <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
        <Link
          href="/student"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Courses
        </Link>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Course not found or you are not enrolled.
        </div>
      </main>
    );
  }

  // Find the lesson
  let lesson = null;
  for (const module of learningData.modules) {
    const found = module.lessons.find((l) => l.id === lessonId);
    if (found) {
      lesson = found;
      break;
    }
  }

  if (!lesson) {
    return (
      <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
        <Link
          href={`/student/courses/${slug}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Course
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          Lesson not found.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
      <Link
        href={`/student/courses/${slug}`}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Course
      </Link>

      <LessonPlayer
        lesson={{
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          contentType: lesson.content_type,
          videoUrl: lesson.video_url,
          pdfUrl: lesson.pdf_url,
          durationSeconds: lesson.duration_seconds,
          resources: lesson.resources,
        }}
        completed={lesson.completed}
      />
    </main>
  );
}
