import { createClient } from "@/lib/supabase/server";
import {
  BookOpenText,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import EnrollNowButton from "./enroll-now-button";

type CourseDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CourseDetailsPage({
  params,
}: CourseDetailsPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    isAdmin = profile?.role === "admin";
  }

  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !course) {
    notFound();
  }

  const { data: moduleRows } = await supabase
    .from("course_modules")
    .select("title, description, position, published")
    .eq("course_id", course.id)
    .eq("published", true)
    .order("position", { ascending: true });

  const curriculumModules = (moduleRows ?? []).map((moduleRow) => ({
    title: moduleRow.title,
    description: moduleRow.description,
  }));

  // Normalise DB row to the shape the JSX expects.
  const c = {
    ...course,
    descriptionDetailed: course.description_detailed,
    compareAtPrice: course.compare_at_price,
    reviewCount: course.review_count,
    // included / outcomes are stored as JSONB arrays.
    modules:
      curriculumModules.length > 0
        ? curriculumModules
        : ((course.modules as { title: string; description: string }[]) ?? []),
    included: (course.included as string[]) ?? [],
    outcomes: (course.outcomes as string[]) ?? [],
  };
  const hasDiscount = c.compareAtPrice > c.price;

  return (
    <main className="relative mx-auto w-full max-w-6xl px-5 pb-14 pt-6 sm:px-8 sm:pt-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-0 h-56 w-56 rounded-full bg-(--theme-surface-sunken) blur-3xl" />
        <div className="absolute -right-12 top-20 h-64 w-64 rounded-full bg-(--theme-surface-sunken) blur-3xl" />
      </div>

      <section className="relative overflow-hidden rounded-3xl border border-(--theme-border) bg-(--theme-surface) shadow-lg">
        <div
          className={`border-b border-(--theme-border) bg-linear-to-r p-6 sm:p-8 ${c.accent}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="rounded-full bg-(--theme-tag-featured-bg) px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-(--theme-tag-featured-text)">
              {c.category}
            </p>
            <Link
              href="/courses"
              className="rounded-full border border-(--theme-border) bg-(--theme-surface) px-3 py-1 text-xs font-semibold text-(--theme-text-secondary) transition hover:bg-(--theme-surface-raised)"
            >
              Back to Courses
            </Link>
          </div>

          <h1 className="mt-4 text-3xl font-semibold leading-tight text-(--theme-text-primary) sm:text-4xl">
            {c.name}
          </h1>
          <p className="mt-3 max-w-3xl text-base text-(--theme-text-secondary) sm:text-lg">
            {c.tagline}
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-(--theme-border) bg-(--theme-surface) px-3 py-1.5 text-xs font-semibold text-(--theme-text-secondary)">
              <Star className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
              {c.rating} ({c.reviewCount} reviews)
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-(--theme-border) bg-(--theme-surface) px-3 py-1.5 text-xs font-semibold text-(--theme-text-secondary)">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              {c.downloads} learners
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-(--theme-border) bg-(--theme-surface) px-3 py-1.5 text-xs font-semibold text-(--theme-text-secondary)">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              Self-paced + mentor support
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-(--theme-border) bg-(--theme-surface) px-3 py-1.5 text-xs font-semibold text-(--theme-text-secondary)">
              <BookOpenText className="h-3.5 w-3.5" aria-hidden="true" />
              {c.modules.length} modules
            </span>
          </div>
        </div>

        <div className="grid gap-5 p-6 sm:p-8 lg:grid-cols-[1.7fr_1fr]">
          <div className="space-y-5">
            <article className="rounded-2xl border border-(--theme-card-border) bg-(--theme-surface-raised) p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold text-(--theme-text-primary)">
                Course Overview
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-(--theme-text-secondary)">
                {c.descriptionDetailed}
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-(--theme-border) bg-(--theme-surface) p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-(--theme-text-muted)">
                    Learning Style
                  </p>
                  <p className="mt-1 text-sm font-semibold text-(--theme-text-primary)">
                    Live + Self-Paced
                  </p>
                </div>
                <div className="rounded-xl border border-(--theme-border) bg-(--theme-surface) p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-(--theme-text-muted)">
                    Skill Level
                  </p>
                  <p className="mt-1 text-sm font-semibold text-(--theme-text-primary)">
                    Beginner to Advanced
                  </p>
                </div>
                <div className="rounded-xl border border-(--theme-border) bg-(--theme-surface) p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-(--theme-text-muted)">
                    Outcome Focus
                  </p>
                  <p className="mt-1 text-sm font-semibold text-(--theme-text-primary)">
                    Portfolio + Career Ready
                  </p>
                </div>
              </div>
            </article>

            <div className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-2xl border border-(--theme-border) bg-(--theme-surface-raised) p-5 shadow-sm">
                <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-(--theme-text-primary)">
                  <ShieldCheck
                    className="h-5 w-5 text-(--theme-brand)"
                    aria-hidden="true"
                  />
                  What is included
                </h2>
                <ul className="mt-3 space-y-2.5 text-sm text-(--theme-text-secondary)">
                  {c.included.map((item: string) => (
                    <li key={item} className="flex gap-2.5">
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-(--theme-brand)"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rounded-2xl border border-(--theme-border) bg-(--theme-surface-raised) p-5 shadow-sm">
                <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-(--theme-text-primary)">
                  <Trophy
                    className="h-5 w-5 text-(--theme-brand)"
                    aria-hidden="true"
                  />
                  Outcomes
                </h2>
                <ul className="mt-3 space-y-2.5 text-sm text-(--theme-text-secondary)">
                  {c.outcomes.map((item: string) => (
                    <li key={item} className="flex gap-2.5">
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-(--theme-brand)"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
            <article className="rounded-2xl border border-(--theme-border) bg-(--theme-surface-raised) p-5 shadow-sm sm:p-6">
              <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-(--theme-text-primary)">
                <Sparkles
                  className="h-5 w-5 text-(--theme-brand)"
                  aria-hidden="true"
                />
                Program Curriculum
              </h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {c.modules.map(
                  (
                    module: { title: string; description: string },
                    index: number,
                  ) => (
                    <li
                      key={module.title}
                      className="rounded-xl border border-(--theme-border) bg-(--theme-surface) p-3 transition hover:-translate-y-0.5 hover:shadow-sm"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-(--theme-text-muted)">
                        Step {index + 1}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-(--theme-text-primary)">
                        {module.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-(--theme-text-secondary)">
                        {module.description}
                      </p>
                    </li>
                  ),
                )}
              </ul>
            </article>
          </div>

          <aside className="h-fit rounded-2xl border border-(--theme-card-featured-border) bg-(--theme-surface) p-5 shadow-sm lg:sticky lg:top-24">
            <p className="text-sm text-(--theme-text-secondary)">Program Fee</p>
            <div className="mt-1 flex items-baseline gap-2">
              <p className="text-3xl font-bold text-(--theme-text-primary)">
                ${c.price}
              </p>
              {hasDiscount ? (
                <p className="text-sm text-(--theme-text-muted) line-through">
                  ${c.compareAtPrice}
                </p>
              ) : null}
            </div>
            {hasDiscount ? (
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-600">
                Save ${c.compareAtPrice - c.price}
              </p>
            ) : null}

            <div className="mt-4 rounded-xl border border-(--theme-border) bg-(--theme-surface-sunken) p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-(--theme-text-muted)">
                Included in fee
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-(--theme-text-secondary)">
                <li className="flex items-center gap-2">
                  <CheckCircle2
                    className="h-3.5 w-3.5 text-(--theme-brand)"
                    aria-hidden="true"
                  />
                  Lifetime access to updates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2
                    className="h-3.5 w-3.5 text-(--theme-brand)"
                    aria-hidden="true"
                  />
                  Mentor support and doubt clearing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2
                    className="h-3.5 w-3.5 text-(--theme-brand)"
                    aria-hidden="true"
                  />
                  Certificate on completion
                </li>
              </ul>
            </div>

            {isAdmin ? (
              <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-700">
                Admin accounts cannot enroll in courses.
              </p>
            ) : (
              <EnrollNowButton
                courseSlug={c.slug}
                courseName={c.name}
                price={c.price}
                compareAtPrice={c.compareAtPrice}
                accent={c.accent}
              />
            )}

            <Link
              href="/courses"
              className="mt-2 inline-flex w-full justify-center rounded-xl border border-(--theme-btn-ghost-border) bg-(--theme-surface) px-4 py-2.5 text-sm font-semibold text-(--theme-btn-ghost-text) transition hover:bg-(--theme-surface-sunken)"
            >
              Continue Browsing
            </Link>

            <div className="mt-5 rounded-xl border border-(--theme-border) bg-(--theme-surface-sunken) p-3 text-xs text-(--theme-text-secondary)">
              One-time payment. Lifetime access to course updates and resources.
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
