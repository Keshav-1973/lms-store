"use client";

import { useCart } from "@/components/cart-provider";
import { Product } from "@/data/products";
import { useUserRole } from "@/lib/use-user-role";
import { BookOpenText, Clock3, Sparkles, Star, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CoursesPage() {
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

  return (
    <main className="relative mx-auto w-full max-w-7xl px-5 pb-10 pt-4 sm:px-8 sm:pt-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 top-6 h-56 w-56 rounded-full bg-(--theme-surface-sunken) blur-3xl" />
        <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-(--theme-surface-sunken) blur-3xl" />
      </div>

      <section className="relative rounded-3xl border border-(--theme-hero-border) bg-(--theme-hero-bg) p-4 shadow-md sm:p-5">
        <p className="inline-flex rounded-full border border-(--theme-border) bg-(--theme-surface-sunken) px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-(--theme-text-secondary)">
          All our programs
        </p>
        <h1 className="mt-3 text-2xl font-semibold leading-tight text-(--theme-text-primary) sm:text-3xl">
          Pick a course and get started
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-(--theme-text-secondary)">
          Here's everything we offer. Check them out, compare, and sign up for
          the one that fits what you're trying to learn.
        </p>
      </section>

      {loading ? (
        <section className="relative mt-5 rounded-3xl border border-(--theme-border) bg-(--theme-surface) p-4 shadow-sm sm:p-5">
          <div className="mb-3 h-6 w-32 animate-pulse rounded-lg bg-(--theme-surface-sunken)" />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <article
                key={`course-skeleton-${index}`}
                className="flex h-full flex-col rounded-2xl border border-(--theme-card-border) bg-(--theme-card-bg) p-3 shadow-sm"
              >
                <div className="rounded-xl border border-(--theme-border) bg-(--theme-surface-sunken) p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="h-5 w-20 animate-pulse rounded-full bg-(--theme-surface)" />
                    <span className="h-5 w-16 animate-pulse rounded-full bg-(--theme-surface)" />
                  </div>
                  <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-(--theme-surface)" />
                  <div className="mt-2 h-3 w-full animate-pulse rounded bg-(--theme-surface)" />
                  <div className="mt-1 h-3 w-5/6 animate-pulse rounded bg-(--theme-surface)" />
                </div>

                <div className="mt-3 flex gap-1.5">
                  <span className="h-5 w-14 animate-pulse rounded-full bg-(--theme-surface-sunken)" />
                  <span className="h-5 w-14 animate-pulse rounded-full bg-(--theme-surface-sunken)" />
                  <span className="h-5 w-14 animate-pulse rounded-full bg-(--theme-surface-sunken)" />
                </div>

                <div className="mt-3 rounded-xl border border-(--theme-border) bg-(--theme-surface-sunken) p-2.5">
                  <div className="h-3 w-16 animate-pulse rounded bg-(--theme-surface)" />
                  <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-(--theme-surface)" />
                </div>

                <div className="mt-3 h-7 w-20 animate-pulse rounded bg-(--theme-surface-sunken)" />

                <div className="mt-auto flex gap-1.5 pt-3">
                  <span className="h-8 flex-1 animate-pulse rounded-lg bg-(--theme-surface-sunken)" />
                  <span className="h-8 flex-1 animate-pulse rounded-lg bg-(--theme-surface-sunken)" />
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      {error ? (
        <section className="mt-5 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 shadow-sm sm:p-7">
          {error}
        </section>
      ) : null}
      {!loading && !error && courses.length === 0 ? (
        <section className="mt-5 rounded-3xl border border-(--theme-border) bg-(--theme-surface) p-5 text-sm text-(--theme-text-secondary) shadow-sm sm:p-7">
          No courses found yet.
        </section>
      ) : null}

      {!loading && !error ? (
        <section className="relative mt-5 rounded-3xl border border-(--theme-border) bg-(--theme-surface) p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-(--theme-text-primary)">
              All Courses
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {courses.map((course) =>
              (() => {
                const hasDiscount = course.compareAtPrice > course.price;

                return (
                  <article
                    key={course.slug}
                    className="group flex h-full flex-col rounded-2xl border border-(--theme-card-border) bg-(--theme-card-bg) p-3 shadow-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div
                      className={`rounded-xl border border-(--theme-border) bg-linear-to-br p-3 ${course.accent}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-(--theme-surface) px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-(--theme-text-secondary)">
                          {course.category}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-(--theme-surface) px-2 py-0.5 text-[10px] font-semibold text-(--theme-text-secondary)">
                          <Clock3 className="h-3 w-3" aria-hidden="true" />
                          Self-Paced
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-semibold leading-tight text-(--theme-text-primary)">
                        {course.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-(--theme-text-secondary)">
                        {course.description}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-(--theme-text-secondary)">
                      <span className="inline-flex items-center gap-1 rounded-full border border-(--theme-border) px-2 py-0.5">
                        <Star
                          className="h-3 w-3 text-amber-500"
                          aria-hidden="true"
                        />
                        {course.rating}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-(--theme-border) px-2 py-0.5">
                        <Users className="h-3 w-3" aria-hidden="true" />
                        {course.downloads}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-(--theme-border) px-2 py-0.5">
                        <BookOpenText className="h-3 w-3" aria-hidden="true" />
                        {course.modules.length}
                      </span>
                    </div>

                    <div className="mt-3 rounded-xl border border-(--theme-border) bg-(--theme-surface-sunken) p-2.5">
                      <p className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-(--theme-text-muted)">
                        <Sparkles className="h-3 w-3" aria-hidden="true" />
                        Preview
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-(--theme-text-secondary)">
                        {course.modules[0]?.title}
                      </p>
                    </div>

                    <div className="mt-3 flex items-baseline gap-1.5">
                      <p className="text-xl font-bold text-(--theme-text-primary)">
                        ${course.price}
                      </p>
                      {hasDiscount ? (
                        <p className="text-xs text-(--theme-text-muted) line-through">
                          ${course.compareAtPrice}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-auto flex gap-1.5 pt-3">
                      <Link
                        href={`/courses/${course.slug}`}
                        className={`${isAdmin ? "w-full" : "flex-1"} rounded-lg bg-(--theme-btn-primary-bg) px-2.5 py-2 text-center text-[11px] font-semibold text-(--theme-btn-primary-text) shadow-sm transition duration-300 ease-out hover:bg-(--theme-brand-hover)`}
                      >
                        View Details
                      </Link>
                      {isAdmin ? null : (
                        <button
                          type="button"
                          onClick={() => addToCart(course)}
                          className="flex-1 rounded-lg border border-(--theme-btn-ghost-border) bg-(--theme-surface) px-2.5 py-2 text-[11px] font-semibold text-(--theme-btn-ghost-text) shadow-sm transition duration-300 ease-out hover:bg-(--theme-surface-sunken)"
                        >
                          Enroll
                        </button>
                      )}
                    </div>
                  </article>
                );
              })(),
            )}
          </div>
        </section>
      ) : null}
    </main>
  );
}
