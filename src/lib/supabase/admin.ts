import "server-only";

import { getSupabasePublicEnv, getSupabaseServiceRoleKey } from "@/lib/env";
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const { supabaseUrl } = getSupabasePublicEnv();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
