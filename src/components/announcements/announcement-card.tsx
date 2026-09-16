import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { AnnouncementRow } from "@/lib/types/database"

type AnnouncementCardProps = {
  announcement: AnnouncementRow
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
})

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  return (
    <Card>
      <CardHeader>
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
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
          {announcement.body}
        </p>
      </CardContent>
    </Card>
  )
}
