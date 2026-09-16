import Link from "next/link"
import { LogOut } from "lucide-react"

import { logout } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"

type TopBarProps = {
  userEmail: string
}

export function TopBar({ userEmail }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-2 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <Link
        href="/"
        className="rounded-md font-heading text-sm font-medium tracking-tight outline-none transition-colors hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 sm:text-base"
      >
        Internal Portal
      </Link>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="max-w-[9rem] truncate text-xs text-muted-foreground sm:max-w-none sm:text-sm">
          {userEmail}
        </span>
        <form action={logout}>
          <Button type="submit" variant="secondary" size="sm" className="font-medium">
            <LogOut className="mr-1.5 size-4" aria-hidden="true" />
            Sign out
          </Button>
        </form>
      </div>
    </header>
  )
}
