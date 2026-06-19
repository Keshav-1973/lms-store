"use server";

import { claimPendingPurchasesForUser } from "@/features/enrollments/enrollment-service";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function sanitizeRedirectTo(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "/";
  }

  const trimmed = value.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/";
  }

  return trimmed;
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = sanitizeRedirectTo(formData.get("redirectTo"));

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const params = new URLSearchParams({ error: error.message, redirectTo });
    redirect(`/login?${params.toString()}`);
  }

  // Check role and redirect accordingly.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    if (user.email) {
      try {
        const adminClient = createAdminClient();
        await claimPendingPurchasesForUser(adminClient, user.id, user.email);
      } catch (error) {
        logger.error("Failed to claim pending purchases after login.", {
          userId: user.id,
          error,
        });
      }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") {
      redirect("/admin/courses");
    }

    if (redirectTo.startsWith("/admin")) {
      redirect("/student");
    }
  }

  redirect(redirectTo);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function register(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    const params = new URLSearchParams({
      error: error.message,
      tab: "register",
    });
    redirect(`/login?${params.toString()}`);
  }

  // Supabase may return no error for existing confirmed users to prevent
  // user enumeration. In that case, identities is an empty array.
  if (data.user && (data.user.identities?.length ?? 0) === 0) {
    const params = new URLSearchParams({
      error: "Account already exists. Please sign in instead.",
      tab: "register",
    });
    redirect(`/login?${params.toString()}`);
  }

  redirect("/login?registered=1");
}
