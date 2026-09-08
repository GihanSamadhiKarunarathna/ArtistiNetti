import { getTranslations } from "next-intl/server"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { requireRole } from "@/lib/auth"
import { AddArtistForm } from "@/components/features/agent/add-artist-form"
import { getOwnAgentProfile } from "@/server/services/agent"

export default async function AgentArtistsPage() {
  const [user, t] = await Promise.all([
    requireRole("AGENT"),
    getTranslations("agentDashboard"),
  ])
  const agentProfile = await getOwnAgentProfile(user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("addArtist")}</CardTitle>
        </CardHeader>
        <CardContent>
          <AddArtistForm />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {agentProfile.managedArtists.map((artist) => (
          <Card key={artist.id} className="flex flex-row items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium">{artist.bandName}</p>
              <p className="text-sm text-muted-foreground">{artist.city}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={artist.isPublished ? "default" : "secondary"}>
                {artist.isPublished ? "Live" : artist.approvalStatus}
              </Badge>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/agent/artists/${artist.id}`}>{t("manage")}</Link>
              </Button>
            </div>
          </Card>
        ))}
        {agentProfile.managedArtists.length === 0 && (
          <p className="text-sm text-muted-foreground">No artists yet.</p>
        )}
      </div>
    </div>
  )
}
