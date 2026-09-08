import { format } from "date-fns"
import { getTranslations } from "next-intl/server"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Link } from "@/i18n/navigation"
import { requireRole } from "@/lib/auth"
import { getOwnArtistProfile } from "@/server/services/artist-profile"
import { listInquiriesForArtist } from "@/server/services/inquiries"

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  NEW: "default",
  IN_REVIEW: "secondary",
  QUOTED: "outline",
  ACCEPTED: "default",
  DECLINED: "destructive",
  EXPIRED: "secondary",
  CANCELLED: "destructive",
}

const STATUS_KEY: Record<string, string> = {
  NEW: "statusNew",
  IN_REVIEW: "statusInReview",
  QUOTED: "statusQuoted",
  ACCEPTED: "statusAccepted",
  DECLINED: "statusDeclined",
  EXPIRED: "statusExpired",
  CANCELLED: "statusCancelled",
}

export default async function ArtistInquiriesPage() {
  const [user, t, tEventTypes] = await Promise.all([
    requireRole("ARTIST"),
    getTranslations("inquiries"),
    getTranslations("eventTypes"),
  ])
  const profile = await getOwnArtistProfile(user.id)
  const inquiries = await listInquiriesForArtist(profile.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {inquiries.length === 0 && (
        <p className="text-sm text-muted-foreground">No inquiries yet.</p>
      )}

      <div className="space-y-3">
        {inquiries.map((inquiry) => (
          <Link key={inquiry.id} href={`/artist/inquiries/${inquiry.id}`}>
            <Card className="flex flex-row items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/40">
              <div>
                <p className="font-medium">
                  {inquiry.contactName} · {tEventTypes(inquiry.eventType)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(inquiry.eventDate), "d MMM yyyy")}
                  {inquiry.eventCity ? ` · ${inquiry.eventCity}` : ""}
                </p>
              </div>
              <Badge variant={STATUS_VARIANT[inquiry.status] ?? "secondary"}>
                {t(STATUS_KEY[inquiry.status] as never)}
              </Badge>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
