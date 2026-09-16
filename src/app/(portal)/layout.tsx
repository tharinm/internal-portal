import { createClient } from "@/lib/supabase/server"
import { TopBar } from "@/components/layout/top-bar"

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Non-null: src/proxy.ts already redirects any signed-out request away
  // from every route under (portal), so `user` is structurally guaranteed
  // here. Route protection stays solely in proxy.ts, per CLAUDE.md — this
  // layout must not duplicate that redirect-if-signed-out check.
  return (
    <>
      <TopBar userEmail={user!.email!} />
      <main className="flex-1">{children}</main>
    </>
  )
}
