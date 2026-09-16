"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"

export type CreateAnnouncementState =
  | {
      success?: boolean
      error?: string
      fieldErrors?: {
        title?: string[]
        body?: string[]
      }
    }
  | undefined

const createAnnouncementSchema = z.object({
  title: z.string().trim().min(1, { error: "Title is required." }).max(200),
  body: z.string().trim().min(1, { error: "Body is required." }).max(10_000),
  isPinned: z.boolean(),
})

export async function createAnnouncement(
  _prevState: CreateAnnouncementState,
  formData: FormData
): Promise<CreateAnnouncementState> {
  const supabase = await createClient()

  // proxy.ts only performs an optimistic check; this Server Action is the
  // real authorization boundary and re-verifies the session independently.
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !user.email) {
    return { error: "You must be signed in to post an announcement." }
  }

  const parsed = createAnnouncementSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    isPinned: formData.get("isPinned") === "on",
  })
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const { error } = await supabase.from("announcements").insert({
    title: parsed.data.title,
    body: parsed.data.body,
    is_pinned: parsed.data.isPinned,
    author_id: user.id,
    author_email: user.email,
  })
  if (error) {
    return { error: "Couldn't post the announcement. Please try again." }
  }

  revalidatePath("/")
  return { success: true }
}

export async function deleteAnnouncement(id: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // RLS ensures they can only delete their own
  const { error } = await supabase.from("announcements").delete().eq("id", id).eq("author_id", user.id)
  
  if (error) {
    return { error: "Couldn't delete announcement." }
  }

  revalidatePath("/")
  return { success: true }
}

export async function updateAnnouncement(
  id: string,
  _prevState: CreateAnnouncementState,
  formData: FormData
): Promise<CreateAnnouncementState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be signed in to edit an announcement." }
  }

  const parsed = createAnnouncementSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    isPinned: formData.get("isPinned") === "on",
  })
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const { error } = await supabase.from("announcements").update({
    title: parsed.data.title,
    body: parsed.data.body,
    is_pinned: parsed.data.isPinned,
  }).eq("id", id).eq("author_id", user.id)

  if (error) {
    return { error: "Couldn't update the announcement. Please try again." }
  }

  revalidatePath("/")
  return { success: true }
}
