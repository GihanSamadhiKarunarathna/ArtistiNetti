import { requireRole } from "@/lib/auth"
import { getArtistProfileForMember } from "@/server/services/artist-profile"
import { listAvailability } from "@/server/services/availability"
import { AvailabilityCalendar } from "@/components/features/availability/availability-calendar"
import { SubscribeCalendarButton } from "@/components/features/availability/subscribe-calendar-button"

export default async function AvailabilityPage() {
  const user = await requireRole("ARTIST")
  const profile = await getArtistProfileForMember(user.id)
  const entries = await listAvailability(profile.id)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <SubscribeCalendarButton artistId={profile.id} />
      </div>
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
    </div>
  )
}
