"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import type { SetupAdminState } from "./actions";
import { promoteSelfToAdmin } from "./actions";

const initialState: SetupAdminState = {};

export default function SetupAdminForm() {
  const [state, formAction, isPending] = useActionState(
    promoteSelfToAdmin,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label
          htmlFor="setupSecret"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Admin Setup Secret
        </label>
        <input
          id="setupSecret"
          name="setupSecret"
          type="password"
          required
          placeholder="Paste ADMIN_SETUP_SECRET"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
        />
        <p className="mt-1 text-xs text-slate-400">
          This secret is checked server-side and never exposed to the client.
        </p>
      </div>

      {state.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60 inline-flex items-center justify-center gap-2"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? "Promoting..." : "Make Me Admin"}
      </button>
    </form>
  );
}
