import { Users, Mic2, Clock, Inbox, Euro } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { StatCard } from "@/components/shared/stat-card"
import { getPlatformStats } from "@/server/services/admin"

export default async function AdminOverviewPage() {
  const [t, stats] = await Promise.all([
    getTranslations("adminDashboard"),
    getPlatformStats(),
  ])

  const cards = [
    {
      label: t("totalUsers"),
      value: stats.totalUsers,
      icon: <Users />,
      accent: "primary" as const,
    },
    {
      label: t("totalArtists"),
      value: stats.totalArtists,
      icon: <Mic2 />,
      accent: "chart-2" as const,
    },
    {
      label: t("pendingApprovals"),
      value: stats.pendingApprovals,
      icon: <Clock />,
      accent: "chart-3" as const,
    },
    {
      label: t("totalInquiries"),
      value: stats.totalInquiries,
      icon: <Inbox />,
      accent: "chart-4" as const,
    },
    {
      label: t("grossBookingValue"),
      value: `${stats.grossBookingValueEur}€`,
      icon: <Euro />,
      accent: "primary" as const,
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t("overviewTitle")}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  )
}
