/**
 * Supabase connection settings.
 *
 * The browser always reaches Supabase through `NEXT_PUBLIC_SUPABASE_URL`
 * (e.g. `http://127.0.0.1:54321`). When the Next.js server runs inside a
 * container it can't use that address, so `SUPABASE_SERVER_URL` lets
 * server-side code talk to the same Supabase over the Docker network
 * (e.g. `http://host.docker.internal:54321`). Outside Docker it's unset and
 * both resolve to the public URL — nothing changes.
 *
 * Server-only module: do not import from Client Components.
 */
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const SUPABASE_SERVER_URL =
  process.env.SUPABASE_SERVER_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL!;
