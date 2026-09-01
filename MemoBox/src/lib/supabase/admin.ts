import { createClient } from "@supabase/supabase-js";
import { SUPABASE_SERVER_URL } from "./config";

/**
 * Service-role client — bypasses RLS. Server-only. Use sparingly (seeding,
 * background jobs, admin tooling). Never import into client code.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");

  return createClient(SUPABASE_SERVER_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
