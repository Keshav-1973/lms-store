"use client";

import {
  CheckCircle2,
  ExternalLink,
  FileText,
  PlayCircle,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";

type LessonPlayerProps = {
  lesson: {
    id: string;
    title: string;
    description: string;
    contentType: "video" | "pdf" | "both";
    videoUrl: string | null;
    pdfUrl: string | null;
    durationSeconds: number;
    resources?: Array<{
      id: string;
      title: string;
      description: string;
      type: "video" | "pdf" | "document";
      url: string;
    }>;
  };
  completed: boolean;
};

export function LessonPlayer({ lesson, completed }: LessonPlayerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPdf, setShowPdf] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(completed);

  const handleToggleComplete = useCallback(async () => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch("/api/lessons/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId: lesson.id,
          completed: !localCompleted,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Failed to update progress");
      }

      setLocalCompleted(!localCompleted);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update progress",
      );
    } finally {
      setIsUpdating(false);
    }
  }, [lesson.id, localCompleted]);

  const durationMinutes = Math.ceil(lesson.durationSeconds / 60);
  let completionLabel = "Mark as Complete";
  if (isUpdating) {
    completionLabel = "Updating...";
  } else if (localCompleted) {
    completionLabel = "Mark as Incomplete";
  }

  return (
    <div className="space-y-6">
      {/* No Content Message */}
      {!lesson.videoUrl && !lesson.pdfUrl && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-800">
            Content coming soon
          </p>
          <p className="mt-1 text-sm text-amber-700">
            The content for this lesson is being prepared. Check back soon!
          </p>
        </div>
      )}

      {/* Video Player */}
      {lesson.contentType !== "pdf" && lesson.videoUrl && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 overflow-hidden">
          <div className="relative w-full bg-black rounded-lg overflow-hidden">
            <div
              className="relative w-full"
              style={{ paddingBottom: "56.25%" }}
            >
              <iframe
                src={lesson.videoUrl}
                title={lesson.title}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="absolute top-0 left-0 w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer */}
      {lesson.contentType !== "video" && lesson.pdfUrl && (
        <div className="space-y-3">
          {showPdf ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 overflow-hidden">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">
                  Course Material
                </p>
                <button
                  onClick={() => setShowPdf(false)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="relative w-full bg-black rounded-lg overflow-hidden">
                <div
                  className="relative w-full"
                  style={{ paddingBottom: "141%" }}
                >
                  <iframe
                    src={`${lesson.pdfUrl}#toolbar=0`}
                    title="Course Material"
                    className="absolute top-0 left-0 w-full h-full border-0"
                  />
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowPdf(true)}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:bg-slate-50"
            >
              <FileText className="h-5 w-5 text-slate-600" />
              <div className="flex-1 text-left">
                <p className="font-semibold text-slate-900">Course Material</p>
                <p className="text-sm text-slate-500">PDF Document</p>
              </div>
              <PlayCircle className="h-5 w-5 text-slate-400" />
            </button>
          )}

          <a
            href={lesson.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ExternalLink className="h-4 w-4" />
            Open PDF
          </a>
        </div>
      )}

      {/* Lesson Info */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">{lesson.title}</h1>
        {lesson.description && (
          <p className="mt-3 text-slate-600">{lesson.description}</p>
        )}

        {durationMinutes > 0 && (
          <p className="mt-3 text-sm text-slate-500">
            ⏱️ Duration: {durationMinutes} minutes
          </p>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Completion Button */}
        <button
          onClick={handleToggleComplete}
          disabled={isUpdating}
          className={`mt-4 flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition-colors ${
            localCompleted
              ? "bg-green-50 text-green-700 hover:bg-green-100 disabled:bg-green-50"
              : "bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-700"
          }`}
        >
          <CheckCircle2 className="h-5 w-5" />
          {completionLabel}
        </button>
      </div>

      {/* Resources Section */}
      {lesson.resources && lesson.resources.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-900">Resources</h2>
          <div className="mt-4 space-y-3">
            {lesson.resources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-slate-200 bg-slate-50 p-3 hover:bg-slate-100 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0">
                    {resource.type === "video" && (
                      <PlayCircle className="h-5 w-5 text-blue-600" />
                    )}
                    {resource.type === "pdf" && (
                      <FileText className="h-5 w-5 text-red-600" />
                    )}
                    {resource.type === "document" && (
                      <FileText className="h-5 w-5 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {resource.title}
                    </p>
                    {resource.description && (
                      <p className="text-sm text-slate-600">
                        {resource.description}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 capitalize">
                      {resource.type}
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
