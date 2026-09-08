import { Inbox, CalendarCheck, UserRound } from "lucide-react"
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
import { getOwnArtistProfile } from "@/server/services/artist-profile"
import { countInquiriesByStatus } from "@/server/services/inquiries"
import { countUpcomingGigs } from "@/server/services/availability"

function profileCompleteness(profile: {
  bio: string | null
  heroImageUrl: string | null
  genres: string[]
  minBudgetEur: number | null
}) {
  const checks = [
    Boolean(profile.bio),
    Boolean(profile.heroImageUrl),
    profile.genres.length > 0,
    profile.minBudgetEur != null,
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

export default async function ArtistDashboardPage() {
  const [user, t] = await Promise.all([
    requireRole("ARTIST"),
    getTranslations("artistDashboard"),
  ])
  const profile = await getOwnArtistProfile(user.id)
  const [newInquiries, upcomingGigs] = await Promise.all([
    countInquiriesByStatus(profile.id, "NEW"),
    countUpcomingGigs(profile.id),
  ])

  const completeness = profileCompleteness(profile)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {t("welcomeBack", { name: user.name ?? profile.bandName })}
        </h1>
        {!profile.isPublished && (
          <Badge variant="secondary" className="mt-2">
            {profile.approvalStatus === "APPROVED"
              ? "Your profile is not published yet"
              : "Awaiting admin approval"}
          </Badge>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("newInquiries")}
            </CardTitle>
            <Inbox className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{newInquiries}</p>
            <Button variant="link" className="h-auto p-0" asChild>
              <Link href="/artist/inquiries">View all</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("upcomingGigs")}
            </CardTitle>
            <CalendarCheck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{upcomingGigs}</p>
            <Button variant="link" className="h-auto p-0" asChild>
              <Link href="/artist/availability">View calendar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("profileCompletion")}
            </CardTitle>
            <UserRound className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{completeness}%</p>
            <Button variant="link" className="h-auto p-0" asChild>
              <Link href="/artist/profile">Edit profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
