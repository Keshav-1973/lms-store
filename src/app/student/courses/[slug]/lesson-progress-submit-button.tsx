"use client";

import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

type LessonProgressSubmitButtonProps = {
  completed: boolean;
};

export function LessonProgressSubmitButton({
  completed,
}: LessonProgressSubmitButtonProps) {
  const { pending } = useFormStatus();

  const nextLabel = completed ? "Mark Incomplete" : "Mark Complete";
  let icon = <Circle className="h-4 w-4 text-slate-400" />;
  let text = nextLabel;

  if (pending) {
    icon = <Loader2 className="h-4 w-4 animate-spin text-slate-500" />;
    text = "Updating...";
  } else if (completed) {
    icon = <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  }

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
      aria-busy={pending}
      aria-live="polite"
    >
      {icon}
      {text}
    </button>
  );
}
