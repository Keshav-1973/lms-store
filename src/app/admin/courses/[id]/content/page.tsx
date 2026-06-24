import { listCourseContentForAdmin } from "@/features/lms/lms-service";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseContentForm } from "./course-content-form";

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
    <div className="w-full">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
          href={`/courses/${course.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:w-auto"
        >
          Preview Course Page
        </Link>
      </div>

      <CourseContentForm
        courseId={course.id}
        courseSlug={course.slug}
        modules={modules}
      />
    </div>
  );
}
