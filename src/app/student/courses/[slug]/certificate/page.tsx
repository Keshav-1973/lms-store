import { getStudentCourseLearningData } from "@/features/lms/lms-service";
import { createClient } from "@/lib/supabase/server";
import { Award, CalendarDays } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

type CourseCertificatePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CourseCertificatePage({
  params,
}: CourseCertificatePageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/student/courses/${slug}/certificate`);
  }

  const learningData = await getStudentCourseLearningData(
    supabase,
    user.id,
    slug,
  );

  if (!learningData?.certificate) {
    return (
      <main className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Certificate not available yet. Complete all lessons and generate your
          certificate from the learning page.
        </div>
        <Link
          href={`/student/courses/${slug}`}
          className="mt-4 inline-flex rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Back to Course
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8">
      <section className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 shadow-sm sm:p-10">
        <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">
          <Award className="h-3.5 w-3.5" />
          Certificate of Completion
        </p>

        <h1 className="mt-5 text-3xl font-bold text-slate-900 sm:text-4xl">
          {learningData.course.name}
        </h1>
        <p className="mt-2 text-sm text-slate-600">Awarded to {user.email}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              Certificate Number
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {learningData.certificate.certificate_number}
            </p>
          </div>
          <div className="rounded-xl border border-white bg-white p-4">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              <CalendarDays className="h-3.5 w-3.5" />
              Issued On
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {new Date(
                learningData.certificate.issued_at,
              ).toLocaleDateString()}
            </p>
          </div>
        </div>

        <Link
          href={`/student/courses/${slug}`}
          className="mt-6 inline-flex rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Back to Learning
        </Link>
      </section>
    </main>
  );
}
