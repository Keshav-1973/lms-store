"use client";

import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

type FileUploadFieldProps = {
  type: "video" | "pdf" | "document";
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function FileUploadField({
  type,
  value,
  onChange,
  disabled,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const getFileConfig = () => {
    switch (type) {
      case "video":
        return { accept: "video/*", label: "Video File", maxSize: 100 };
      case "pdf":
        return { accept: ".pdf", label: "PDF File", maxSize: 50 };
      case "document":
        return {
          accept: ".pdf,.doc,.docx,.txt,.ppt,.pptx",
          label: "Document",
          maxSize: 50,
        };
      default:
        return { accept: "*", label: "File", maxSize: 50 };
    }
  };

  const config = getFileConfig();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    const maxSizeBytes = config.maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`File too large. Max size: ${config.maxSize}MB`);
      return;
    }

    setIsUploading(true);
    setProgress(0);

    const toastId = toast.loading(`Uploading ${config.label}… 0%`);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        setProgress(pct);
        toast.loading(`Uploading ${config.label}… ${pct}%`, { id: toastId });
      }
    });

    xhr.addEventListener("load", () => {
      setIsUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          onChange(data.url);
          toast.success(`${config.label} uploaded successfully!`, {
            id: toastId,
          });
        } catch {
          toast.error("Unexpected response from server.", { id: toastId });
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          toast.error(err.error || "Upload failed", { id: toastId });
        } catch {
          toast.error("Upload failed", { id: toastId });
        }
      }
    });

    xhr.addEventListener("error", () => {
      setIsUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
      toast.error("Upload failed — network error", { id: toastId });
    });

    xhr.addEventListener("abort", () => {
      setIsUploading(false);
      setProgress(0);
      toast.dismiss(toastId);
    });

    xhr.open("POST", "/api/upload");
    xhr.send(formData);
  };

  const fileName = value ? value.split("/").pop() : null;

  return (
    <div className="space-y-2">
      {value && fileName ? (
        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
          <div className="min-w-0 flex flex-1 items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-600" />
            <span className="block truncate text-sm font-medium text-emerald-900">
              {fileName}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={disabled || isUploading}
            className="ml-2 shrink-0 text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
            title="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || isUploading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-100 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {isUploading
              ? `Uploading ${config.label.toLowerCase()}… ${progress}%`
              : `Upload ${config.label}`}
          </button>
          {isUploading && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={config.accept}
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="hidden"
      />
    </div>
  );
}
