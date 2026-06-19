"use client";

import { Eye, EyeOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const REMEMBERED_EMAIL_KEY = "skillspring_remembered_email";

export default function LoginFormEnhancements({
  isRegister,
  disabled = false,
}: {
  isRegister: boolean;
  disabled?: boolean;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    if (globalThis.window === undefined || isRegister) {
      return false;
    }

    return Boolean(
      globalThis.window.localStorage.getItem(REMEMBERED_EMAIL_KEY),
    );
  });

  useEffect(() => {
    const form = wrapperRef.current?.closest("form");
    const emailInput = form?.querySelector<HTMLInputElement>("#email");

    if (!form || !emailInput) {
      return;
    }

    if (!isRegister) {
      const rememberedEmail =
        globalThis.localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (rememberedEmail) {
        emailInput.value = rememberedEmail;
      }
    }

    const onSubmit = () => {
      if (isRegister) {
        return;
      }

      const email = emailInput.value.trim();

      if (rememberMe && email) {
        globalThis.localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      } else {
        globalThis.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }

      // Best effort: hint supported browsers to offer password save/update.
      const win = globalThis as {
        PasswordCredential?: new (form: HTMLFormElement) => unknown;
        navigator: {
          credentials?: {
            store?: (credential: unknown) => Promise<unknown>;
          };
        };
      };

      if (win.PasswordCredential && win.navigator.credentials?.store) {
        const credential = new win.PasswordCredential(form);
        void win.navigator.credentials.store(credential);
      }
    };

    form.addEventListener("submit", onSubmit);

    return () => {
      form.removeEventListener("submit", onSubmit);
    };
  }, [isRegister, rememberMe]);

  return (
    <div ref={wrapperRef} className="space-y-4">
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-semibold text-slate-700"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            disabled={disabled}
            autoComplete={isRegister ? "new-password" : "current-password"}
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-200/45 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            disabled={disabled}
            className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {isRegister ? null : (
        <label
          htmlFor="rememberMe"
          className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600"
        >
          <input
            id="rememberMe"
            name="rememberMe"
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            disabled={disabled}
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-300 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <span>Remember me on this device</span>
        </label>
      )}
    </div>
  );
}
