import { Inbox, CalendarCheck, UserRound } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/stat-card"
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
        <StatCard
          label={t("newInquiries")}
          value={newInquiries}
          icon={<Inbox />}
          accent="primary"
          action={
            <Button variant="link" className="h-auto p-0" asChild>
              <Link href="/artist/inquiries">View all</Link>
            </Button>
          }
        />
        <StatCard
          label={t("upcomingGigs")}
          value={upcomingGigs}
          icon={<CalendarCheck />}
          accent="chart-2"
          action={
            <Button variant="link" className="h-auto p-0" asChild>
              <Link href="/artist/availability">View calendar</Link>
            </Button>
          }
        />
        <StatCard
          label={t("profileCompletion")}
          value={`${completeness}%`}
          icon={<UserRound />}
          accent="chart-3"
          action={
            <Button variant="link" className="h-auto p-0" asChild>
              <Link href="/artist/profile">Edit profile</Link>
            </Button>
          }
        />
      </div>
    </div>
  )
}
