import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Supabase client for use in Server Components, Server Actions, and Route
 * Handlers. This is the ONLY client application data reads/writes should
 * go through, per CLAUDE.md.
 *
 * Must be called fresh on every request (not module-level cached) since it
 * reads the current request's cookies.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    // Non-null: build-time-injected NEXT_PUBLIC_* env vars required for the
    // app to function; failing fast is preferable to an undefined client.
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          } catch {
            // `setAll` is called from a Server Component during render,
            // where cookies can't be written. This is safe to ignore as
            // long as `middleware.ts` is refreshing the session on every
            // request (see src/lib/supabase/middleware.ts).
          }
        },
      },
    }
  )
}
