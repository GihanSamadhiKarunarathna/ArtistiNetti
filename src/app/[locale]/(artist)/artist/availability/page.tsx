import { requireRole } from "@/lib/auth"
import { getOwnArtistProfile } from "@/server/services/artist-profile"
import { listAvailability } from "@/server/services/availability"
import { AvailabilityCalendar } from "@/components/features/availability/availability-calendar"

export default async function AvailabilityPage() {
  const user = await requireRole("ARTIST")
  const profile = await getOwnArtistProfile(user.id)
  const entries = await listAvailability(profile.id)

  return (
    <AvailabilityCalendar
      entries={entries.map((e) => ({
        id: e.id,
        type: e.type,
        title: e.title,
        startDate: e.startDate.toISOString(),
        endDate: e.endDate.toISOString(),
        notes: e.notes,
        isPublicBusy: e.isPublicBusy,
      }))}
    />
  )
}
