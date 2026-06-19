import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { ServerSupabaseClient } from "@/lib/supabase/types";
import type { User } from "@supabase/supabase-js";

type AuthError = {
  ok: false;
  status: number;
  error: string;
};

type UserContext = {
  ok: true;
  supabase: ServerSupabaseClient;
  user: User;
};

export async function requireAuthenticatedUser(): Promise<
  AuthError | UserContext
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, status: 401, error: "Unauthorized." };
  }

  return { ok: true, supabase, user };
}

export async function requireAdminUser(): Promise<AuthError | UserContext> {
  const auth = await requireAuthenticatedUser();

  if (!auth.ok) {
    return auth;
  }

  const { data: profile } = await auth.supabase
    .from("profiles")
    .select("role")
    .eq("id", auth.user.id)
    .single();

  if (profile?.role !== "admin") {
    return { ok: false, status: 403, error: "Forbidden." };
  }

  return auth;
}
