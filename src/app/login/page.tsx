import { LoginForm } from "@/components/auth/login-form"

function isSafeRedirect(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
}

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams
  const redirectTo = isSafeRedirect(params.redirectTo) ? params.redirectTo : "/"

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-8">
      <LoginForm redirectTo={redirectTo} />
    </main>
  )
}
