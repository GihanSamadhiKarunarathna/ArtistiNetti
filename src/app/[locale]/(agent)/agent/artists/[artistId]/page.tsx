import { format } from "date-fns"
import { getTranslations } from "next-intl/server"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Link } from "@/i18n/navigation"
import { requireRole } from "@/lib/auth"
import { getArtistForAgent } from "@/server/services/agent"
import { listInquiriesForArtist } from "@/server/services/inquiries"

export default async function AgentArtistDetailPage({
  params,
}: {
  params: Promise<{ artistId: string }>
}) {
  const { artistId } = await params
  const [user, tEventTypes] = await Promise.all([
    requireRole("AGENT"),
    getTranslations("eventTypes"),
  ])
  const artist = await getArtistForAgent(user.id, artistId)
  const inquiries = await listInquiriesForArtist(artist.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{artist.bandName}</h1>
        <p className="text-muted-foreground">
          <Link href={`/${artist.bandSlug}`} className="hover:underline">
            View public page
          </Link>
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-medium">Inquiries</h2>
        {inquiries.length === 0 && (
          <p className="text-sm text-muted-foreground">No inquiries yet.</p>
        )}
        {inquiries.map((inquiry) => (
          <Card key={inquiry.id} className="flex flex-row items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium">
                {inquiry.contactName} · {tEventTypes(inquiry.eventType)}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(inquiry.eventDate), "d MMM yyyy")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge>{inquiry.status}</Badge>
              {inquiry.gigThread && (
                <Link
                  href={`/agent/messages/${inquiry.gigThread.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Messages
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
