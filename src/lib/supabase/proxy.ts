import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

/** Routes reachable without a signed-in session. */
const PUBLIC_PATHS = ["/login", "/auth"]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )
}

/**
 * Refreshes the Supabase auth session on every request and redirects
 * unauthenticated requests away from protected routes.
 *
 * Called from root `middleware.ts`. This is the single place route
 * protection is decided, per CLAUDE.md — pages must not duplicate this
 * redirect-if-signed-out logic.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    // Non-null: build-time-injected NEXT_PUBLIC_* env vars required for the
    // app to function; failing fast is preferable to an undefined client.
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          response = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
        },
      },
    }
  )

  // IMPORTANT: do not remove this call. getUser() revalidates the session
  // token against Supabase Auth on every request; skipping it would let
  // expired/forged sessions through.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && !isPublicPath(request.nextUrl.pathname)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}
