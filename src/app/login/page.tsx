import Link from "next/link";
import { login, register } from "./actions";
import LoginForm from "./login-form";

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
            Welcome to SkillSolutions
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

        <LoginForm
          action={isRegister ? register : login}
          isRegister={isRegister}
          redirectTo={redirectTo}
        />

        <p className="mt-5 text-center text-xs text-slate-400">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </section>
    </main>
  );
}
