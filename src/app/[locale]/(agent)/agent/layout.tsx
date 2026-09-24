import { LayoutDashboard, Users, Building2 } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/dashboard-shell"
import { requireRole } from "@/lib/auth"

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, t] = await Promise.all([
    requireRole("AGENT"),
    getTranslations("dashboardNav"),
  ])

  const navItems: DashboardNavItem[] = [
    { href: "/agent/dashboard", label: t("overview"), icon: <LayoutDashboard /> },
    { href: "/agent/artists", label: t("artists"), icon: <Users /> },
    { href: "/agent/agency", label: t("agency"), icon: <Building2 /> },
  ]

  return (
    <DashboardShell
      navItems={navItems}
      brandLabel="ArtistiNetti"
      userName={user.name}
      userEmail={user.email}
      dashboardHref="/agent/dashboard"
    >
      {children}
    </DashboardShell>
  )
}
