import { NextResponse, type NextRequest } from "next/server"

import { createClient } from "@/lib/supabase/server"

/**
 * Supabase email-confirmation redirect target (set via `emailRedirectTo` in
 * `signup()`, src/lib/actions/auth.ts). This is the one legitimate use of a
 * Route Handler here — it's a redirect target Supabase itself calls, not an
 * internal-portal UI mutation, so CLAUDE.md's "no app/api for mutations"
 * rule doesn't apply.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL("/", request.url))
}
