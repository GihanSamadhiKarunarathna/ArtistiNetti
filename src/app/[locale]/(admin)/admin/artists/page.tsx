import { getTranslations } from "next-intl/server"
import { ArtistsTable } from "@/components/features/admin/artists-table"
import { listArtistApprovalQueue } from "@/server/services/admin"

export default async function AdminArtistsPage() {
  const [t, artists] = await Promise.all([
    getTranslations("adminDashboard"),
    listArtistApprovalQueue(),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t("artistApprovalsTitle")}</h1>
      <ArtistsTable
        artists={artists.map((a) => ({
          id: a.id,
          bandName: a.bandName,
          bandSlug: a.bandSlug,
          city: a.city,
          approvalStatus: a.approvalStatus,
          isPublished: a.isPublished,
          ownerId: a.owner.id,
          ownerEmail: a.owner.email,
        }))}
      />
    </div>
  )
}
