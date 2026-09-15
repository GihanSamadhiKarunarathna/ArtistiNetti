"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Link } from "@/i18n/navigation"

export function MobileNav({
  labels,
  isLoggedIn,
  dashboardHref,
}: {
  labels: {
    discover: string
    howItWorks: string
    forArtists: string
    login: string
    register: string
    dashboard: string
    logout: string
  }
  isLoggedIn: boolean
  dashboardHref: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <nav className="flex flex-col gap-1 p-4 text-sm font-medium">
          <Link
            href="/discover"
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-2.5 hover:bg-muted"
          >
            {labels.discover}
          </Link>
          <Link
            href="/#how-it-works"
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-2.5 hover:bg-muted"
          >
            {labels.howItWorks}
          </Link>
          {!isLoggedIn && (
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 hover:bg-muted"
            >
              {labels.forArtists}
            </Link>
          )}

          <Separator className="my-3" />

          {isLoggedIn ? (
            <>
              <Link
                href={dashboardHref}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 hover:bg-muted"
              >
                {labels.dashboard}
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-lg px-3 py-2.5 text-left hover:bg-muted"
              >
                {labels.logout}
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 px-3 pt-1">
              <Button variant="outline" asChild>
                <Link href="/login" onClick={() => setOpen(false)}>
                  {labels.login}
                </Link>
              </Button>
              <Button asChild>
                <Link href="/register" onClick={() => setOpen(false)}>
                  {labels.register}
                </Link>
              </Button>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
