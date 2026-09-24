import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireRole } from "@/lib/auth"
import { SwitchAgencyForm } from "@/components/features/agency/switch-agency-form"
import { getArtistProfileForMember } from "@/server/services/artist-profile"

export default async function ArtistAgencyPage() {
  const user = await requireRole("ARTIST")
  const profile = await getArtistProfileForMember(user.id)
  const isSelfManaged = profile.agencyId === profile.ownAgencyId

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Agency representation</h1>
        <p className="text-muted-foreground">
          Choose which booking agency represents you, or manage your own bookings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {profile.agency.name}
            {isSelfManaged && <Badge variant="secondary">Self-managed</Badge>}
          </CardTitle>
          {profile.agency.businessId && (
            <CardDescription>Business ID: {profile.agency.businessId}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {profile.isOwner ? (
            <SwitchAgencyForm isSelfManaged={isSelfManaged} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Only the band&apos;s primary admin can change agency representation.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
