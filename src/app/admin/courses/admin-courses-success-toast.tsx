"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function AdminCoursesSuccessToast() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const successType = searchParams.get("success");
    const courseName = searchParams.get("course")?.trim() ?? "";

    if (!successType) {
      return;
    }

    const actionText = successType === "updated" ? "updated" : "created";
    const message = courseName
      ? `${courseName} ${actionText} successfully.`
      : `Course ${actionText} successfully.`;

    toast.success(message);

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("success");
    nextParams.delete("course");

    const nextQuery = nextParams.toString();
    const nextUrl = nextQuery
      ? `${window.location.pathname}?${nextQuery}`
      : window.location.pathname;

    window.history.replaceState(null, "", nextUrl);
  }, [searchParams]);

  return null;
}
