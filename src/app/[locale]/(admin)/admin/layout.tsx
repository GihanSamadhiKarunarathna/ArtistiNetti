import { LayoutDashboard, Users, ShieldCheck } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/dashboard-shell"
import { requireRole } from "@/lib/auth"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, t] = await Promise.all([
    requireRole("ADMIN"),
    getTranslations("dashboardNav"),
  ])

  const navItems: DashboardNavItem[] = [
    { href: "/admin", label: t("overview"), icon: <LayoutDashboard /> },
    { href: "/admin/users", label: t("users"), icon: <Users /> },
    { href: "/admin/artists", label: t("artistApprovals"), icon: <ShieldCheck /> },
  ]

  return (
    <DashboardShell
      navItems={navItems}
      brandLabel="ArtistiNetti Admin"
      userName={user.name}
      userEmail={user.email}
      dashboardHref="/admin"
    >
      {children}
    </DashboardShell>
  )
}
