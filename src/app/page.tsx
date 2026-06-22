"use client";

import { useCart } from "@/components/cart-provider";
import { Product } from "@/data/products";
import { useUserRole } from "@/lib/use-user-role";
import {
  Award,
  Briefcase,
  GraduationCap,
  Phone,
  Quote,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [courses, setCourses] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { isAdmin } = useUserRole();

  useEffect(() => {
    async function loadCourses() {
      try {
        const response = await fetch("/api/courses", { cache: "no-store" });
        const data = (await response.json()) as {
          courses?: Product[];
          error?: string;
          warning?: string;
        };

        if (!response.ok || !data.courses) {
          throw new Error(data.error ?? "Unable to load courses.");
        }

        setCourses(data.courses);
      } catch (fetchError) {
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load courses.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  const groupedByCategory = useMemo(() => {
    return courses.reduce<Record<string, Product[]>>((acc, course) => {
      const existing = acc[course.category] ?? [];
      existing.push(course);
      acc[course.category] = existing;
      return acc;
    }, {});
  }, [courses]);

  const highlights = [
    {
      title: "Live Classes",
      description: "Interactive sessions with mentors and real-time Q&A.",
      tone: "from-(--theme-surface) via-(--theme-surface-raised) to-(--theme-surface-sunken) border-(--theme-border)",
    },
    {
      title: "Top Instructors",
      description: "Learn from working experts in Data, Web, and AI.",
      tone: "from-(--theme-surface-raised) via-(--theme-surface) to-(--theme-surface-sunken) border-(--theme-border)",
    },
    {
      title: "Certifications",
      description: "Earn verifiable certificates after course completion.",
      tone: "from-(--theme-surface) via-(--theme-surface-sunken) to-(--theme-surface) border-(--theme-border)",
    },
    {
      title: "100% Job Assistance",
      description: "Resume prep, mock interviews, and hiring referrals.",
      tone: "from-(--theme-surface-raised) via-(--theme-surface) to-(--theme-surface-sunken) border-(--theme-border)",
    },
  ] as const;

  const testimonials = [
    {
      quote:
        "I switched from a non-tech background and landed my first analyst role in 5 months. The projects made all the difference.",
      name: "Ananya S.",
      role: "Data Analyst",
      tone: "from-(--theme-testimonial-card) via-(--theme-surface) to-(--theme-testimonial-bg) border-(--theme-testimonial-border)",
    },
    {
      quote:
        "The full-stack path was practical and clear. I built 3 portfolio apps and now freelance for international clients.",
      name: "Rohan M.",
      role: "Frontend Developer",
      tone: "from-(--theme-testimonial-card) via-(--theme-surface) to-(--theme-testimonial-bg) border-(--theme-testimonial-border)",
    },
    {
      quote:
        "Mock interviews and mentorship gave me confidence. I cracked a cloud engineer role right after course completion.",
      name: "Nikhil P.",
      role: "Cloud Engineer",
      tone: "from-(--theme-testimonial-card) via-(--theme-surface) to-(--theme-testimonial-bg) border-(--theme-testimonial-border)",
    },
  ] as const;

  const highlightIcons = {
    "Live Classes": GraduationCap,
    "Top Instructors": Users,
    Certifications: Award,
    "100% Job Assistance": Briefcase,
  } as const;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-(--theme-page-bg) text-(--theme-text-primary)">
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-float absolute -left-20 top-20 h-72 w-72 rounded-full bg-(--theme-surface-sunken) blur-3xl" />
        <div className="animate-float-delay absolute right-0 top-0 h-96 w-96 rounded-full bg-(--theme-surface-sunken) blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-(--theme-surface-sunken) blur-3xl" />
      </div>

      <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 pb-14 pt-6 sm:px-8 sm:pt-8">
        <section className="reveal-up rounded-3xl border border-(--theme-hero-border) bg-(--theme-hero-bg) p-6 shadow-lg backdrop-blur-sm sm:p-10">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
              Cohort based and self paced
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:mt-5 sm:text-6xl">
              Learn in-demand tech skills with expert-led online classes
            </h1>
            <p className="mt-4 max-w-2xl text-base text-slate-700 sm:mt-5 sm:text-lg">
              From Data Science to AI/ML and modern Web Development, build
              projects, get mentorship, and move from beginner to confident
              practitioner.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  document.getElementById("courses")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-lg"
              >
                Browse learning paths
              </button>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                <Users className="h-4 w-4" aria-hidden="true" />
                8,000+ learners
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                <GraduationCap
                  className="h-4 w-4 text-slate-600"
                  aria-hidden="true"
                />
                45+ live instructors
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                <Award className="h-4 w-4 text-slate-600" aria-hidden="true" />
                92% completion rate
              </span>
            </div>
          </div>
        </section>

        <section className="reveal-up grid grid-cols-2 gap-4 lg:grid-cols-4">
          {highlights.map((item) => {
            const Icon = highlightIcons[item.title];

            return (
              <article
                key={item.title}
                className={`rounded-2xl border bg-linear-to-br p-5 shadow-sm backdrop-blur-sm ${item.tone}`}
              >
                <span className="inline-flex rounded-lg bg-white/75 p-2 ring-1 ring-slate-200/70">
                  <Icon className="h-6 w-6 text-slate-700" aria-hidden="true" />
                </span>
                <h2 className="mt-3 text-lg font-semibold text-slate-900">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm text-slate-700">
                  {item.description}
                </p>
              </article>
            );
          })}
        </section>

        <section
          id="courses"
          className="reveal-up space-y-5 scroll-mt-24 rounded-3xl border border-(--theme-border) bg-(--theme-surface) p-5 shadow-sm sm:p-7"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold sm:text-3xl">Courses</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }, (_, index) => (
                <article
                  key={`home-course-skeleton-${index}`}
                  className="h-full rounded-3xl border border-white/70 bg-white/85 p-5 shadow-lg"
                >
                  <div className="mt-3 flex min-h-52.5 flex-col rounded-2xl border border-white/80 bg-slate-100 p-4 shadow-sm">
                    <div className="h-5 w-3/4 animate-pulse rounded bg-white" />
                    <div className="mt-3 h-3 w-full animate-pulse rounded bg-white" />
                    <div className="mt-2 h-3 w-11/12 animate-pulse rounded bg-white" />
                    <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-white" />
                  </div>

                  <div className="mt-5 h-8 w-24 animate-pulse rounded bg-slate-100" />

                  <div className="mt-auto flex gap-2 pt-5">
                    <span className="h-9 flex-1 animate-pulse rounded-xl bg-slate-100" />
                    <span className="h-9 flex-1 animate-pulse rounded-xl bg-slate-100" />
                  </div>
                </article>
              ))}
            </div>
          ) : null}
          {error ? <p className="text-red-600">{error}</p> : null}
          {!loading && !error && courses.length === 0 ? (
            <p className="text-slate-600">No courses found yet.</p>
          ) : null}

          {!loading && !error ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(groupedByCategory).flatMap(
                ([, categoryCourses]) =>
                  categoryCourses.map((course) => {
                    const hasDiscount = course.compareAtPrice > course.price;

                    return (
                      <article
                        key={course.slug}
                        className="group reveal-up h-full rounded-3xl border border-white/70 bg-white/85 p-5 shadow-lg transition duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl flex flex-col"
                      >
                        <div className="grow">
                          <div className="flex items-start justify-between gap-2"></div>
                          <div
                            className={`mt-3 flex min-h-52.5 flex-col rounded-2xl border border-white/80 bg-linear-to-br p-4 shadow-sm ${course.accent}`}
                          >
                            <h4 className="text-lg font-semibold leading-tight text-slate-900">
                              {course.name}
                            </h4>
                            <p className="mt-3 grow text-sm text-slate-700">
                              {course.description}
                            </p>
                          </div>
                          <div>
                            {!!course.rating && (
                              <div className="mt-2 flex items-center gap-1">
                                <Star
                                  className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                                  aria-hidden="true"
                                />
                                <span className="text-sm font-semibold text-slate-900">
                                  {course.rating}
                                </span>
                                <span className="text-xs text-slate-500">
                                  ({course.reviewCount} reviews)
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="mt-5 flex items-baseline gap-2">
                            <p className="text-2xl font-bold text-cyan-700">
                              ${course.price}
                            </p>
                            {hasDiscount && (
                              <p className="text-sm text-slate-500 line-through">
                                ${course.compareAtPrice}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-auto pt-5 flex gap-2">
                          <Link
                            href={`/courses/${course.slug}`}
                            className={`${isAdmin ? "w-full" : "flex-1"} rounded-xl bg-black px-3 py-2 text-center text-xs font-semibold text-white shadow-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-black/90 hover:shadow-lg`}
                          >
                            View Details
                          </Link>
                          {isAdmin ? null : (
                            <button
                              type="button"
                              onClick={() => addToCart(course)}
                              className="flex-1 rounded-xl border border-black bg-white px-3 py-2 text-xs font-semibold text-black shadow-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-lg"
                            >
                              Enroll Now
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  }),
              )}
            </div>
          ) : null}
        </section>

        <section className="reveal-up rounded-3xl border border-(--theme-testimonial-border) bg-(--theme-testimonial-bg) p-5 shadow-sm sm:p-7">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
                Testimonials
              </p>
              <h2 className="mt-2 inline-flex items-center gap-2 text-2xl font-semibold sm:text-3xl">
                <Quote className="h-6 w-6 text-slate-700" aria-hidden="true" />
                What learners say
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((item) => (
              <article
                key={item.name}
                className={`rounded-2xl border bg-linear-to-br p-5 shadow-sm ${item.tone}`}
              >
                <Quote className="h-4 w-4 text-slate-500" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-slate-700">
                  “{item.quote}”
                </p>
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-500">{item.role}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Link
        href="tel:+18053022666"
        aria-label="Call SkillSolutions support"
        title="Call us"
        className="fixed bottom-6 right-6 z-20 inline-flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500 text-slate-950 shadow-xl ring-4 ring-cyan-200/50 transition hover:-translate-y-0.5 hover:bg-cyan-400"
      >
        <Phone className="h-6 w-6" aria-hidden="true" />
      </Link>
    </div>
  );
}
