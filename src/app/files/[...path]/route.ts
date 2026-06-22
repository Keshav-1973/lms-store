import { getSupabasePublicEnv } from "@/lib/env";
import { NextRequest, NextResponse } from "next/server";

type FileRouteProps = {
  params: Promise<{
    path: string[];
  }>;
};

const DEFAULT_BUCKET = "course-content";
const LMS_BUCKET = process.env.SUPABASE_LMS_BUCKET ?? "lms-assets";

function resolveBucketAndObjectPath(path: string[]) {
  const first = path.at(0);
  const allowedBuckets = new Set([DEFAULT_BUCKET, LMS_BUCKET]);

  if (first && allowedBuckets.has(first) && path.length > 1) {
    return {
      bucket: first,
      objectPath: path.slice(1),
    };
  }

  // Backward compatibility for already-issued URLs: /files/<object-path>
  return {
    bucket: DEFAULT_BUCKET,
    objectPath: path,
  };
}

export async function GET(request: NextRequest, { params }: FileRouteProps) {
  const { path } = await params;

  if (!path || path.length === 0) {
    return NextResponse.json({ error: "Missing file path" }, { status: 400 });
  }

  const { bucket, objectPath } = resolveBucketAndObjectPath(path);
  if (objectPath.length === 0) {
    return NextResponse.json({ error: "Missing file path" }, { status: 400 });
  }

  const { supabaseUrl } = getSupabasePublicEnv();
  const encodedPath = objectPath
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const upstreamUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${encodedPath}`;

  const range = request.headers.get("range");
  const upstream = await fetch(upstreamUrl, {
    headers: range ? { range } : undefined,
    cache: "no-store",
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "File not found" },
      { status: upstream.status === 404 ? 404 : 502 },
    );
  }

  const headers = new Headers();
  const forwardHeaders = [
    "content-type",
    "content-length",
    "cache-control",
    "accept-ranges",
    "content-range",
    "etag",
    "last-modified",
  ];

  for (const headerName of forwardHeaders) {
    const value = upstream.headers.get(headerName);
    if (value) {
      headers.set(headerName, value);
    }
  }

  const filename = objectPath.at(-1) ?? "file";
  headers.set("content-disposition", `inline; filename="${filename}"`);

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers,
  });
}
