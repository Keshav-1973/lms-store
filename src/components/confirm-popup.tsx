"use client";

import { Loader2, X } from "lucide-react";
import type { ReactNode } from "react";

type ConfirmPopupProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  icon?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export function ConfirmPopup({
  open,
  title,
  description,
  icon,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmPopupProps) {
  if (!open) {
    return null;
  }

  return (
    <dialog
      open
      aria-labelledby="confirm-popup-title"
      className="fixed inset-0 z-50 m-0 flex h-full w-full max-w-none items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
            {icon}
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="text-slate-400 transition hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <h2
          id="confirm-popup-title"
          className="mt-4 text-base font-semibold text-slate-900"
        >
          {title}
        </h2>
        <p className="mt-1.5 text-sm text-slate-500">{description}</p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={isLoading}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 cursor-pointer rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
