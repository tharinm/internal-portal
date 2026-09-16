"use client"

import { useFormStatus } from "react-dom"
import { LogOut, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

export function SignOutButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" variant="secondary" size="sm" className="font-medium" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-1.5 size-4 animate-spin" aria-hidden="true" />
      ) : (
        <LogOut className="mr-1.5 size-4" aria-hidden="true" />
      )}
      {pending ? "Signing out..." : "Sign out"}
    </Button>
  )
}
