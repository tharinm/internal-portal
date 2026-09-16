import Link from "next/link"
import { Megaphone } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { AnnouncementForm } from "@/components/announcements/announcement-form"
import { AnnouncementCard } from "@/components/announcements/announcement-card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 sm:py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Announcements</h1>
      <AnnouncementForm />
      <Separator />
      <div className="flex flex-col gap-4">
        {announcements && announcements.length > 0 ? (
          announcements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-12 text-center">
            <Megaphone className="size-8 text-muted-foreground" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-medium">No announcements yet</p>
              <p className="text-sm text-muted-foreground">
                Be the first to share an update with the team.
              </p>
            </div>
            <Button render={<Link href="#announcement-form" />} size="sm">
              Post an announcement
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
