"use client"

import { useActionState, useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { createAnnouncement } from "@/lib/actions/announcements"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

export function AnnouncementForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, formAction, pending] = useActionState(createAnnouncement, undefined)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
      toast.success("Announcement posted!")
      onSuccess?.()
    }
  }, [state, onSuccess])

  return (
    <form ref={formRef} action={formAction} id="announcement-form" className="flex flex-col gap-4">
      <FieldGroup>
        {state?.error && (
          <FieldError role="alert">{state.error}</FieldError>
        )}
        <Field data-invalid={!!state?.fieldErrors?.title}>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input
            id="title"
            name="title"
            placeholder="What's the update?"
            aria-invalid={!!state?.fieldErrors?.title}
            required
          />
          <FieldError
            errors={state?.fieldErrors?.title?.map((message) => ({ message }))}
          />
        </Field>
        <Field data-invalid={!!state?.fieldErrors?.body}>
          <FieldLabel htmlFor="body">Details</FieldLabel>
          <Textarea
            id="body"
            name="body"
            placeholder="Share the details with the team…"
            rows={4}
            aria-invalid={!!state?.fieldErrors?.body}
            required
          />
          <FieldError
            errors={state?.fieldErrors?.body?.map((message) => ({ message }))}
          />
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="isPinned" name="isPinned" />
          <FieldLabel htmlFor="isPinned">Pin this announcement</FieldLabel>
        </Field>
      </FieldGroup>
      <div className="flex justify-end pt-4 border-t mt-2">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {pending ? "Posting…" : "Post announcement"}
        </Button>
      </div>
    </form>
  )
}
