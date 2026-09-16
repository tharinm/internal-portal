"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { deleteAnnouncement } from "@/lib/actions/announcements"

type DeleteButtonProps = {
  announcementId: string
}

import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
      {pending ? "Deleting..." : "Delete"}
    </Button>
  )
}

export function DeleteButton({ announcementId }: DeleteButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            title="Delete announcement"
            className="cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md p-2 transition-colors"
          />
        }
      >
        <Trash2 className="size-4" aria-hidden="true" />
        <span className="sr-only">Delete</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Announcement</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this announcement? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <form 
            action={async () => {
              const result = await deleteAnnouncement(announcementId)
              if (result.success) {
                toast.success("Announcement deleted!", { id: "delete-success" })
                setOpen(false)
              } else if (result.error) {
                toast.error(result.error, { id: "delete-error" })
              }
            }}
          >
            <SubmitButton />
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
