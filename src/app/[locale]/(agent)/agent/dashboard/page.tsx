import { Mic2 } from "lucide-react"
import { getTranslations } from "next-intl/server"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

      <Card className="max-w-sm">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Managed artists
          </CardTitle>
          <Mic2 className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">{agentProfile.managedArtists.length}</p>
          <Button variant="link" className="h-auto p-0" asChild>
            <Link href="/agent/artists">{t("manage")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
