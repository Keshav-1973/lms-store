"use client";

import { ConfirmPopup } from "@/components/confirm-popup";
import { Trash2 } from "lucide-react";
import { useActionState, useRef, useState } from "react";
import { deleteCourse } from "./actions";

export function DeleteCourseButton({
  courseId,
  courseName,
  label,
  className,
}: {
  courseId: string;
  courseName: string;
  label?: string;
  className?: string;
}) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [, formAction, isPending] = useActionState(
    deleteCourse.bind(null, courseId),
    undefined,
  );
  const buttonClassName = [
    label
      ? "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
      : "rounded-lg p-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-500",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const openConfirm = () => {
    setIsConfirmOpen(true);
  };

  const cancelConfirm = () => {
    setIsConfirmOpen(false);
  };

  const confirmDelete = () => {
    setIsConfirmOpen(false);
    formRef.current?.requestSubmit();
  };

  return (
    <>
      <form ref={formRef} action={formAction}>
        <button
          type="button"
          title="Delete course"
          onClick={openConfirm}
          className={buttonClassName}
        >
          <Trash2 className="h-4 w-4" />
          {label ? <span>{label}</span> : null}
        </button>
      </form>

      <ConfirmPopup
        open={isConfirmOpen}
        title="Delete course?"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-medium text-slate-700">
              &quot;{courseName}&quot;
            </span>{" "}
            ? This cannot be undone.
          </>
        }
        icon={<Trash2 className="h-5 w-5 text-red-500" />}
        cancelLabel="Cancel"
        confirmLabel="Delete"
        onCancel={cancelConfirm}
        onConfirm={confirmDelete}
        isLoading={isPending}
      />
    </>
  );
}
