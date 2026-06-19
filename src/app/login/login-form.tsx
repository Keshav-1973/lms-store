"use client";

import { BookOpen, Loader2 } from "lucide-react";
import { useTransition } from "react";
import LoginFormEnhancements from "./login-form-enhancements";

export default function LoginForm({
  action,
  isRegister,
  redirectTo,
}: {
  action: (formData: FormData) => Promise<void>;
  isRegister: boolean;
  redirectTo: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => action(formData));
  };

  return (
    <form
      onSubmit={handleSubmit}
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
            disabled={isPending}
            autoComplete="username"
            placeholder="you@example.com"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-200/45 disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <LoginFormEnhancements isRegister={isRegister} disabled={isPending} />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-slate-900 via-slate-800 to-slate-700 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:from-slate-800 hover:to-slate-700 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <BookOpen className="h-4 w-4" />
        )}
        {isPending
          ? isRegister
            ? "Creating Account…"
            : "Signing In…"
          : isRegister
            ? "Create Account"
            : "Sign In"}
      </button>
    </form>
  );
}
