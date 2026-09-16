import { createBrowserClient } from "@supabase/ssr"

/**
 * Supabase client for use in Client Components.
 *
 * Only for reacting to client-side auth state (e.g. sign-out, session
 * change listeners) — per CLAUDE.md, application data reads/writes never
 * go through this client. Reads happen in Server Components via
 * `src/lib/supabase/server.ts`; writes happen in Server Actions.
 */
export function createClient() {
  // Non-null: these are build-time-injected NEXT_PUBLIC_* env vars that must
  // be set for the app to function at all; failing fast here is preferable
  // to a silently-undefined Supabase client.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
