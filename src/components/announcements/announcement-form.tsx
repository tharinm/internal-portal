"use client"

import { useActionState, useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { createAnnouncement } from "@/lib/actions/announcements"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

export function AnnouncementForm() {
  const [state, formAction, pending] = useActionState(createAnnouncement, undefined)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
      toast.success("Announcement posted!")
    }
  }, [state])

  return (
    <Card id="announcement-form" className="w-full">
      <CardHeader>
        <CardTitle className="tracking-tight">Post an announcement</CardTitle>
      </CardHeader>
      <form ref={formRef} action={formAction}>
        <CardContent>
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
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
            {pending ? "Posting…" : "Post announcement"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
