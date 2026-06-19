"use client";

import { ConfirmPopup } from "@/components/confirm-popup";
import { Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { deleteCourse } from "./actions";

export function DeleteCourseButton({
  courseId,
  courseName,
}: {
  courseId: string;
  courseName: string;
}) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

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
      <form ref={formRef} action={deleteCourse.bind(null, courseId)}>
        <button
          type="button"
          title="Delete course"
          onClick={openConfirm}
          className="rounded-lg p-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
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
            </span>
            ? This cannot be undone.
          </>
        }
        icon={<Trash2 className="h-5 w-5 text-red-500" />}
        cancelLabel="Cancel"
        confirmLabel="Delete"
        onCancel={cancelConfirm}
        onConfirm={confirmDelete}
      />
    </>
  );
}
