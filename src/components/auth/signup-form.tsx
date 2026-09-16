"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Loader2 } from "lucide-react"

import { signup } from "@/lib/actions/auth"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, undefined)

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="tracking-tight">Create an account</CardTitle>
        <CardDescription>
          Sign up with your team email to get access to the internal portal.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent>
          <FieldGroup>
            {state?.error && (
              <FieldError role="alert">{state.error}</FieldError>
            )}
            <Field data-invalid={!!state?.fieldErrors?.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                aria-invalid={!!state?.fieldErrors?.email}
                required
              />
              <FieldError
                errors={state?.fieldErrors?.email?.map((message) => ({ message }))}
              />
            </Field>
            <Field data-invalid={!!state?.fieldErrors?.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!state?.fieldErrors?.password}
                required
              />
              <FieldError
                errors={state?.fieldErrors?.password?.map((message) => ({ message }))}
              />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="mt-4 flex-col items-stretch gap-3">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
            {pending ? "Creating account…" : "Sign up"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
