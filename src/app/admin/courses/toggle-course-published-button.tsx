"use client";

import { ConfirmPopup } from "@/components/confirm-popup";
import { EyeOff, Loader2, Rocket } from "lucide-react";
import type { ReactNode } from "react";
import { useActionState, useRef, useState } from "react";
import { toggleCoursePublished } from "./actions";

export function ToggleCoursePublishedButton({
  courseId,
  published,
  className,
}: {
  courseId: string;
  published: boolean;
  className: string;
}) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [, formAction, isPending] = useActionState(
    toggleCoursePublished.bind(null, courseId, !published),
    undefined,
  );
  const statusLabel = published ? "Unpublish" : "Publish";
  let statusIcon: ReactNode = <Rocket className="h-3.5 w-3.5" />;

  if (published) {
    statusIcon = <EyeOff className="h-3.5 w-3.5" />;
  }

  if (isPending) {
    statusIcon = <Loader2 className="h-3.5 w-3.5 animate-spin" />;
  }

  const openConfirm = () => {
    setIsConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (isPending) {
      return;
    }

    setIsConfirmOpen(false);
  };

  const confirmUnpublish = () => {
    setIsConfirmOpen(false);
    formRef.current?.requestSubmit();
  };

  const handleClick = () => {
    if (published) {
      openConfirm();
      return;
    }

    formRef.current?.requestSubmit();
  };

  return (
    <>
      <form ref={formRef} action={formAction}>
        <button
          type="button"
          onClick={handleClick}
          disabled={isPending}
          className={className}
        >
          {statusIcon}
          {statusLabel}
        </button>
      </form>

      <ConfirmPopup
        open={isConfirmOpen}
        title="Unpublish course?"
        description="This course will be hidden from the public catalogue until you publish it again."
        icon={<EyeOff className="h-5 w-5 text-red-500" />}
        cancelLabel="Cancel"
        confirmLabel="Unpublish"
        loadingLabel="Unpublishing..."
        onCancel={closeConfirm}
        onConfirm={confirmUnpublish}
        isLoading={isPending}
      />
    </>
  );
}
