import {
  LayoutDashboard,
  UserRound,
  CalendarDays,
  Inbox,
} from "lucide-react"
import { getTranslations } from "next-intl/server"
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/dashboard-shell"
import { requireRole } from "@/lib/auth"

export default async function ArtistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, t] = await Promise.all([
    requireRole("ARTIST"),
    getTranslations("dashboardNav"),
  ])

  const navItems: DashboardNavItem[] = [
    { href: "/artist/dashboard", label: t("overview"), icon: <LayoutDashboard /> },
    { href: "/artist/profile", label: t("profile"), icon: <UserRound /> },
    { href: "/artist/availability", label: t("availability"), icon: <CalendarDays /> },
    { href: "/artist/inquiries", label: t("inquiries"), icon: <Inbox /> },
  ]

  return (
    <DashboardShell
      navItems={navItems}
      brandLabel="ArtistiNetti"
      userName={user.name}
      userEmail={user.email}
      dashboardHref="/artist/dashboard"
    >
      {children}
    </DashboardShell>
  )
}
