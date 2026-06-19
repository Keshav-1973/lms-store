"use server";

import { env, isProduction } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type SetupAdminState = {
  error?: string;
  success?: string;
};

export async function promoteSelfToAdmin(
  _prevState: SetupAdminState,
  formData: FormData,
): Promise<SetupAdminState> {
  if (isProduction() && !env.allowProductionAdminSetup) {
    return {
      error: "Setup-admin is disabled in production.",
    };
  }

  const setupSecret = (formData.get("setupSecret") as string | null)?.trim();
  const expectedSecret = env.adminSetupSecret;

  if (!expectedSecret) {
    return {
      error:
        "ADMIN_SETUP_SECRET is not configured on the server. Add it to your .env.local file.",
    };
  }

  if (!setupSecret || setupSecret !== expectedSecret) {
    return { error: "Invalid setup secret." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be logged in to promote your account." };
  }

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("profiles")
    .upsert({ id: user.id, role: "admin" }, { onConflict: "id" });

  if (error) {
    return { error: error.message };
  }

  return {
    success: "Your account is now an admin. You can open /admin/courses.",
  };
}
