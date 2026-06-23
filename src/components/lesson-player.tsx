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
  const hasContent = lesson.videoUrl || lesson.pdfUrl;
  let completionLabel = "Mark as Complete";
  if (isUpdating) {
    completionLabel = "Updating...";
  } else if (!hasContent) {
    completionLabel = "No Content Available";
  } else if (localCompleted) {
    completionLabel = "Mark as Incomplete";
  }

  return (
    <div className="space-y-6">
      {/* No Content Message */}
      {!lesson.videoUrl && !lesson.pdfUrl && (
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-amber-50 to-yellow-50 p-6 shadow-sm">
          <div className="flex gap-4">
            <div className="shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                <span className="text-xl">⚡</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-900">
                Content coming soon
              </p>
              <p className="mt-2 text-sm text-amber-800 leading-relaxed">
                The content for this lesson is being prepared. Check back soon!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Video Player */}
      {lesson.contentType !== "pdf" && lesson.videoUrl && (
        <div className="group rounded-3xl border border-slate-100 bg-white p-2 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="relative w-full bg-slate-900 rounded-2xl overflow-hidden">
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
        <div className="space-y-4">
          {showPdf ? (
            <div className="rounded-3xl border border-slate-100 bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-slate-100 p-2">
                    <FileText className="h-5 w-5 text-slate-700" />
                  </div>
                  <p className="font-semibold text-slate-900">
                    Course Material
                  </p>
                </div>
                <button
                  onClick={() => setShowPdf(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all duration-200"
                  aria-label="Close PDF"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="relative w-full bg-slate-900 rounded-none overflow-hidden">
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
              className="w-full group/btn rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-5 shadow-md hover:shadow-lg hover:border-slate-200 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="shrink-0 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 p-3 group-hover/btn:from-blue-100 group-hover/btn:to-blue-200 transition-all duration-300">
                  <FileText className="h-6 w-6 text-slate-600 group-hover/btn:text-blue-600 transition-colors duration-300" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-slate-900 group-hover/btn:text-slate-950 transition-colors duration-300">
                    Course Material
                  </p>
                  <p className="text-sm text-slate-500 mt-1">PDF Document</p>
                </div>
                <div className="shrink-0 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 p-3 group-hover/btn:from-blue-100 group-hover/btn:to-blue-200 transition-all duration-300">
                  <FileText className="h-5 w-5 text-slate-400 group-hover/btn:text-blue-600 transition-colors duration-300" />
                </div>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Lesson Info */}
      <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-8 shadow-md hover:shadow-lg transition-all duration-300">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold text-slate-900 leading-tight">
            {lesson.title}
          </h1>
          {lesson.description && (
            <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-2xl">
              {lesson.description}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            {durationMinutes > 0 && (
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 px-4 py-2">
                <span className="text-lg">⏱️</span>
                <p className="text-sm font-medium text-blue-900">
                  {durationMinutes} minutes
                </p>
              </div>
            )}
            {localCompleted && (
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 px-4 py-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <p className="text-sm font-medium text-green-900">Completed</p>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 px-5 py-4 text-sm shadow-sm">
            <p className="font-semibold text-red-900">Error</p>
            <p className="mt-1 text-red-800">{error}</p>
          </div>
        )}

        {/* Completion Button */}
        <div className="mt-8">
          <button
            onClick={handleToggleComplete}
            disabled={isUpdating || !hasContent}
            className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 min-w-48 ${
              !hasContent
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : localCompleted
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 disabled:from-green-400 disabled:to-emerald-400 focus:ring-green-300 shadow-lg hover:shadow-xl"
                  : "bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-slate-800 hover:to-slate-700 disabled:from-slate-700 disabled:to-slate-600 focus:ring-slate-500 shadow-lg hover:shadow-xl"
            }`}
          >
            <CheckCircle2 className="h-5 w-5" />
            <span>{completionLabel}</span>
          </button>
        </div>
      </div>

      {/* Resources Section */}
      {lesson.resources && lesson.resources.length > 0 && (
        <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-8 shadow-md hover:shadow-lg transition-all duration-300">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Resources</h2>
          <p className="text-slate-600 text-sm mb-6">
            Access additional materials for this lesson
          </p>
          <div className="grid gap-4">
            {lesson.resources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100 hover:from-blue-50 hover:to-blue-100 p-5 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 rounded-xl bg-white p-3 group-hover:bg-blue-100 transition-colors duration-300 shadow-sm">
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
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 group-hover:text-slate-950 transition-colors">
                      {resource.title}
                    </p>
                    {resource.description && (
                      <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                        {resource.description}
                      </p>
                    )}
                    <div className="mt-3 inline-flex gap-2">
                      <span className="inline-block rounded-lg bg-white px-3 py-1 text-xs font-medium text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors capitalize shadow-sm">
                        {resource.type}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1 text-xs font-medium text-slate-500 group-hover:text-blue-600 transition-colors">
                        <ExternalLink className="h-3 w-3" />
                        Open
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
