import { markLessonCompletion } from "@/features/lms/lms-service";
import { requireAuthenticatedUser } from "@/lib/auth/require-admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser();

    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { lessonId, completed = true } = body;

    if (!lessonId) {
      return NextResponse.json({ error: "Missing lessonId" }, { status: 400 });
    }

    const result = await markLessonCompletion(
      auth.supabase,
      auth.user.id,
      lessonId,
      completed,
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
