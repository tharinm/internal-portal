import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { AnnouncementRow } from "@/lib/types/database"
import { DeleteButton } from "@/components/announcements/delete-button"
import { EditButton } from "@/components/announcements/edit-button"

type AnnouncementCardProps = {
  announcement: AnnouncementRow
  currentUserId?: string
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
})

export function AnnouncementCard({ announcement, currentUserId }: AnnouncementCardProps) {
  const authorInitial = announcement.author_email?.charAt(0).toUpperCase() || "?"
  const isAuthor = currentUserId === announcement.author_id

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-4">
        <div className="flex gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
            {authorInitial}
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="tracking-tight">{announcement.title}</CardTitle>
              {announcement.is_pinned && <Badge>Pinned</Badge>}
            </div>
            <CardDescription>
              {announcement.author_email} &middot;{" "}
              <span className="font-mono text-xs">
                {dateFormatter.format(new Date(announcement.created_at))}
              </span>
            </CardDescription>
          </div>
        </div>
        {isAuthor && (
          <div className="flex items-center gap-1">
            <EditButton announcement={announcement} />
            <DeleteButton announcementId={announcement.id} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground ml-14">
          {announcement.body}
        </p>
      </CardContent>
    </Card>
  )
}
