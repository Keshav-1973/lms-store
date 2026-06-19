import { BookOpen } from "lucide-react";
import Link from "next/link";
import { login, register } from "./actions";
import LoginFormEnhancements from "./login-form-enhancements";

type SearchParams = Promise<{
  error?: string;
  redirectTo?: string;
  registered?: string;
  tab?: string;
}>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { error, redirectTo = "/", registered, tab } = await searchParams;
  const isRegister = tab === "register";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16 sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-8 h-64 w-64 rounded-full bg-cyan-200/55 blur-3xl" />
        <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-blue-200/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-56 w-80 -translate-x-1/2 rounded-full bg-indigo-100/60 blur-3xl" />
      </div>

      <section className="reveal-up relative w-full max-w-md rounded-3xl border border-white/70 bg-white/88 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-7">
        <div className="mb-7 flex flex-col items-center gap-2 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 text-sm font-extrabold text-white shadow-md">
            SS
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Welcome to SkillSpring
          </h1>
          <p className="max-w-xs text-sm text-slate-500">
            {isRegister
              ? "Create your student account and start learning today."
              : "Sign in to continue your learning journey."}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
          <Link
            href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}
            className={`rounded-xl py-2 text-center text-sm font-semibold transition ${
              isRegister
                ? "text-slate-500 hover:text-slate-700"
                : "bg-white text-slate-900 shadow-sm"
            }`}
          >
            Sign In
          </Link>
          <Link
            href={`/login?tab=register&redirectTo=${encodeURIComponent(redirectTo)}`}
            className={`rounded-xl py-2 text-center text-sm font-semibold transition ${
              isRegister
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Register
          </Link>
        </div>

        {registered === "1" && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Account created. Check your email to confirm, then sign in.
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          action={isRegister ? register : login}
          className="rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-sm"
        >
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="username"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-200/45"
              />
            </div>

            <LoginFormEnhancements isRegister={isRegister} />
          </div>

          <button
            type="submit"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-slate-900 via-slate-800 to-slate-700 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:from-slate-800 hover:to-slate-700 active:translate-y-0"
          >
            <BookOpen className="h-4 w-4" />
            {isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-400">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </section>
    </main>
  );
}
