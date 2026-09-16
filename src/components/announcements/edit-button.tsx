"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AnnouncementForm } from "./announcement-form"
import type { AnnouncementRow } from "@/lib/types/database"

export function EditButton({ announcement }: { announcement: AnnouncementRow }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            title="Edit announcement"
            className="cursor-pointer text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-md p-2 transition-colors"
          />
        }
      >
        <Pencil className="size-4" aria-hidden="true" />
        <span className="sr-only">Edit</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit announcement</DialogTitle>
          <DialogDescription>Make changes to your post here.</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <AnnouncementForm onSuccess={() => setOpen(false)} initialData={announcement} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
