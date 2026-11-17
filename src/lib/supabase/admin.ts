import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getPublicSupabaseEnv, getServiceRoleKey } from "./env";

/**
 * Service-role client — server-only. Bypasses RLS.
 * Never import this module from client components or expose the key.
 */
export function createAdminClient() {
  const { url } = getPublicSupabaseEnv();
  return createClient<Database>(url, getServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
