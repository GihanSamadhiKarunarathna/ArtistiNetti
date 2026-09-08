import { Users, Mic2, Clock, Inbox, Euro } from "lucide-react"
import { getTranslations } from "next-intl/server"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getPlatformStats } from "@/server/services/admin"

export default async function AdminOverviewPage() {
  const [t, stats] = await Promise.all([
    getTranslations("adminDashboard"),
    getPlatformStats(),
  ])

  const cards = [
    { label: t("totalUsers"), value: stats.totalUsers, icon: Users },
    { label: t("totalArtists"), value: stats.totalArtists, icon: Mic2 },
    { label: t("pendingApprovals"), value: stats.pendingApprovals, icon: Clock },
    { label: t("totalInquiries"), value: stats.totalInquiries, icon: Inbox },
    {
      label: t("grossBookingValue"),
      value: `${stats.grossBookingValueEur}€`,
      icon: Euro,
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t("overviewTitle")}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
