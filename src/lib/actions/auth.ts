"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"

export type AuthActionState =
  | {
      error?: string
      fieldErrors?: {
        email?: string[]
        password?: string[]
      }
    }
  | undefined

const loginSchema = z.object({
  email: z.email({ error: "Enter a valid email." }),
  password: z.string().min(1, { error: "Password is required." }),
})

const signupSchema = z.object({
  email: z.email({ error: "Enter a valid email." }),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters." }),
})

/** Only allow same-site relative paths, to avoid an open redirect via ?redirectTo=. */
function safeRedirect(path: FormDataEntryValue | null): string {
  if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//")) {
    return "/"
  }
  return path
}

export async function login(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) {
    return { error: "Invalid email or password." }
  }

  redirect(safeRedirect(formData.get("redirectTo")))
}

export async function signup(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const origin = (await headers()).get("origin") ?? ""
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  })
  if (error) {
    return { error: error.message }
  }

  // If the project requires email confirmation, no session is issued yet.
  if (!data.session) {
    return {
      error: "Account created. Check your email to confirm it before signing in.",
    }
  }

  redirect("/")
}

export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
