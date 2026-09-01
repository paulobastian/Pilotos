import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_SERVER_URL } from "./config";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * In Next.js 16 `cookies()` is async, so this factory is async too.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_SERVER_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — safe to ignore when the
          // session refresh is handled by proxy.ts.
        }
      },
    },
  });
}
