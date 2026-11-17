import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getPublicSupabaseEnv } from "./env";

/** Browser (client-component) Supabase client — anon key only. */
export function createClient() {
  const { url, anonKey } = getPublicSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}
