import { requireAdminUser } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const UPLOAD_BUCKET = process.env.SUPABASE_LMS_BUCKET ?? "lms-assets";

function isBucketNotFoundError(error: { message?: string } | null) {
  return (error?.message ?? "").toLowerCase().includes("bucket not found");
}

async function ensureUploadBucket(adminSupabase: SupabaseClient) {
  const { data: buckets, error: bucketsError } =
    await adminSupabase.storage.listBuckets();

  if (bucketsError) {
    throw new Error(`Failed to list storage buckets: ${bucketsError.message}`);
  }

  const bucketExists = buckets?.some((b) => b.name === UPLOAD_BUCKET);
  if (bucketExists) {
    return;
  }

  const { error: bucketError } = await adminSupabase.storage.createBucket(
    UPLOAD_BUCKET,
    { public: true },
  );

  if (bucketError) {
    throw new Error(
      bucketError.message || "Failed to initialise storage bucket",
    );
  }
}

async function uploadToUploadBucket(
  adminSupabase: SupabaseClient,
  filename: string,
  buffer: Buffer,
  contentType: string,
) {
  let result = await adminSupabase.storage
    .from(UPLOAD_BUCKET)
    .upload(filename, buffer, {
      contentType,
      upsert: false,
    });

  if (result.error && isBucketNotFoundError(result.error)) {
    await ensureUploadBucket(adminSupabase);
    result = await adminSupabase.storage
      .from(UPLOAD_BUCKET)
      .upload(filename, buffer, {
        contentType,
        upsert: false,
      });
  }

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminUser();

    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // "video", "pdf", or "document"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!type || !["video", "pdf", "document"].includes(type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Validate file size (100MB for video, 50MB for other files)
    const maxSize = type === "video" ? 100 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max size: ${maxSize / 1024 / 1024}MB` },
        { status: 400 },
      );
    }

    // Validate file type
    const validTypes: Record<string, string[]> = {
      video: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
      pdf: ["application/pdf"],
      document: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ],
    };

    if (!validTypes[type]?.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type for ${type}` },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const filename = `${type}/${timestamp}-${randomStr}-${file.name}`;

    // Upload to Supabase Storage using admin client to bypass RLS
    const adminSupabase = createAdminClient();

    await ensureUploadBucket(adminSupabase);

    const { data, error } = await uploadToUploadBucket(
      adminSupabase,
      filename,
      buffer,
      file.type,
    );

    if (error) {
      console.error("Upload error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to upload file" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      url: `/files/${UPLOAD_BUCKET}/${data.path}`,
      path: data.path,
    });
  } catch (error) {
    console.error("Upload error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
