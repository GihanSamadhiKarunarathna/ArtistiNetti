"use client"

import { useState, type ReactNode } from "react"
import { Menu, Music4 } from "lucide-react"
import { usePathname } from "@/i18n/navigation"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LocaleSwitcher } from "@/components/layout/locale-switcher"
import { UserMenu } from "@/components/layout/user-menu"
import { cn } from "@/lib/utils"

export type DashboardNavItem = {
  href: string
  label: string
  icon: ReactNode
}

function NavList({
  items,
  onNavigate,
}: {
  items: DashboardNavItem[]
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 p-3">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <span className="size-4 shrink-0 [&>svg]:size-4">{item.icon}</span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function DashboardShell({
  navItems,
  brandLabel,
  userName,
  userEmail,
  dashboardHref,
  children,
  headerExtra,
}: {
  navItems: DashboardNavItem[]
  brandLabel: string
  userName: string | null
  userEmail: string
  dashboardHref: string
  children: ReactNode
  headerExtra?: ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="hidden w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4 font-semibold">
          <Music4 className="size-5 text-sidebar-primary" aria-hidden />
          <span>{brandLabel}</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavList items={navItems} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b bg-background px-4 sm:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-sidebar p-0 text-sidebar-foreground">
              <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4 font-semibold">
                <Music4 className="size-5 text-sidebar-primary" aria-hidden />
                <span>{brandLabel}</span>
              </div>
              <NavList items={navItems} onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex-1">{headerExtra}</div>

          <LocaleSwitcher />
          <UserMenu name={userName} email={userEmail} dashboardHref={dashboardHref} />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
