import { Mic2 } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/stat-card"
import { Link } from "@/i18n/navigation"
import { requireRole } from "@/lib/auth"
import { getOwnAgentProfile } from "@/server/services/agent"

export default async function AgentDashboardPage() {
  const [user, t] = await Promise.all([
    requireRole("AGENT"),
    getTranslations("agentDashboard"),
  ])
  const agentProfile = await getOwnAgentProfile(user.id)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        Welcome back, {user.name ?? agentProfile.agencyName}
      </h1>

      <div className="max-w-sm">
        <StatCard
          label="Managed artists"
          value={agentProfile.managedArtists.length}
          icon={<Mic2 />}
          action={
            <Button variant="link" className="h-auto p-0" asChild>
              <Link href="/agent/artists">{t("manage")}</Link>
            </Button>
          }
        />
      </div>
    </div>
  )
}
