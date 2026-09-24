import { getTranslations } from "next-intl/server"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArtistProfileForm } from "@/components/features/artist/artist-profile-form"
import { BandMembersCard } from "@/components/features/artist/band-members-card"
import { PublishToggle } from "@/components/features/artist/publish-toggle"
import { FileUploadCard } from "@/components/shared/file-upload-card"
import {
  uploadGalleryImageAction,
  uploadHeroImageAction,
  uploadStagePlanAction,
  uploadTechRiderAction,
} from "@/server/actions/artist-profile"
import { requireRole } from "@/lib/auth"
import { Link } from "@/i18n/navigation"
import { getArtistProfileForMember } from "@/server/services/artist-profile"
import { listPendingBandInvites } from "@/server/services/agency"

export default async function ArtistProfilePage() {
  const [user, t] = await Promise.all([
    requireRole("ARTIST"),
    getTranslations("artistDashboard"),
  ])
  const profile = await getArtistProfileForMember(user.id)
  const pendingInvites = await listPendingBandInvites(profile.id)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t("profileTitle")}</h1>
          <p className="text-muted-foreground">{t("profileSubtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <PublishToggle
            isPublished={profile.isPublished}
            approvalStatus={profile.approvalStatus}
          />
          <Button variant="outline" size="sm" asChild>
            <Link href={`/${profile.bandSlug}`}>{t("viewPublicPage")}</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ArtistProfileForm
            profile={{
              bandName: profile.bandName,
              bio: profile.bio,
              bioEn: profile.bioEn,
              genres: profile.genres,
              eventTypes: profile.eventTypes,
              city: profile.city,
              region: profile.region,
              minBudgetEur: profile.minBudgetEur,
              maxBudgetEur: profile.maxBudgetEur,
              spotifyUrl: profile.spotifyUrl,
              youtubeUrl: profile.youtubeUrl,
              websiteUrl: profile.websiteUrl,
              instagramUrl: profile.instagramUrl,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Media & documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <FileUploadCard
            label={t("heroImage")}
            accept="image/*"
            currentUrl={profile.heroImageUrl}
            action={uploadHeroImageAction}
          />
          <FileUploadCard
            label={t("gallery")}
            accept="image/*"
            action={uploadGalleryImageAction}
          />
          <FileUploadCard
            label={t("techRiderUpload")}
            accept="application/pdf"
            currentUrl={profile.techRiderUrl}
            action={uploadTechRiderAction}
            preview="file"
          />
          <FileUploadCard
            label={t("stagePlanUpload")}
            accept="application/pdf"
            currentUrl={profile.stagePlanUrl}
            action={uploadStagePlanAction}
            preview="file"
          />
        </CardContent>
      </Card>

      <BandMembersCard
        members={profile.members.map((m) => ({
          id: m.id,
          displayName: m.displayName,
          instrument: m.instrument,
          isOwner: m.isOwner,
          canManageCalendar: m.canManageCalendar,
          canLogExpenses: m.canLogExpenses,
        }))}
        pendingInvites={pendingInvites.map((i) => ({
          id: i.id,
          email: i.email,
          displayName: i.displayName,
          instrument: i.instrument,
        }))}
      />
    </div>
  )
}
