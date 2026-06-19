"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminHeader() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="sticky top-16 z-20 h-16 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Admin Panel
        </p>
        <nav className="flex items-center gap-2">
          <Link
            href="/admin/courses"
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              isActive("/admin/courses")
                ? "bg-slate-100 text-slate-900"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Courses
          </Link>
          <Link
            href="/admin/students"
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              isActive("/admin/students")
                ? "bg-slate-100 text-slate-900"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Students
          </Link>
        </nav>
      </div>
    </header>
  );
}
