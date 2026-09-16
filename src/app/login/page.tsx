import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

/**
 * Sign-in page. This is a UI stub only — no Server Action is wired up yet.
 * `middleware.ts` sends any unauthenticated request here (see
 * `src/lib/supabase/middleware.ts`). Real Supabase email/password
 * sign-in via a Server Action is the next piece of work on top of this
 * bootstrap.
 */
export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Sign in with your team email to access the internal portal.
          </CardDescription>
        </CardHeader>
        <form>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="mt-4">
            <Button type="submit" className="w-full" disabled>
              Sign in
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}
