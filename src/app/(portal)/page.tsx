import { Megaphone } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { CreatePostDialog } from "@/components/announcements/create-post-dialog"
import { AnnouncementCard } from "@/components/announcements/announcement-card"
import { Button } from "@/components/ui/button"

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-4 sm:px-6 pb-12">
      <div className="sticky top-14 z-10 flex items-center justify-between bg-background/95 backdrop-blur-sm py-4 sm:py-6 -mx-4 px-4 sm:-mx-6 sm:px-6 mb-2">
        <h1 className="text-2xl font-semibold tracking-tight">Announcements</h1>
        <CreatePostDialog />
      </div>
      <div className="flex flex-col gap-4">
        {announcements && announcements.length > 0 ? (
          announcements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} currentUserId={user?.id} />
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
            <CreatePostDialog
              trigger={
                <Button size="sm">Post an announcement</Button>
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}
