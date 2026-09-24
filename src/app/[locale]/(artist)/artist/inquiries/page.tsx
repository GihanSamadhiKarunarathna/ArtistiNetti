import { format } from "date-fns"
import { getTranslations } from "next-intl/server"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Link } from "@/i18n/navigation"
import { requireRole } from "@/lib/auth"
import { getArtistProfileForMember } from "@/server/services/artist-profile"
import { listInquiriesForArtist } from "@/server/services/inquiries"
import { GateOneActions } from "@/components/features/inquiries/gate-one-actions"

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  AWAITING_ARTIST_CONFIRMATION: "outline",
  NEW: "default",
  IN_REVIEW: "secondary",
  QUOTED: "outline",
  ACCEPTED: "default",
  DECLINED: "destructive",
  EXPIRED: "secondary",
  CANCELLED: "destructive",
}

const STATUS_KEY: Record<string, string> = {
  AWAITING_ARTIST_CONFIRMATION: "statusAwaitingConfirmation",
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
  const profile = await getArtistProfileForMember(user.id)
  const inquiries = await listInquiriesForArtist(profile.id)

  const awaitingConfirmation = inquiries.filter(
    (i) => i.status === "AWAITING_ARTIST_CONFIRMATION",
  )
  const active = inquiries.filter((i) => i.status !== "AWAITING_ARTIST_CONFIRMATION")

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {awaitingConfirmation.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-primary">
            {t("awaitingYourConfirmation")} ({awaitingConfirmation.length})
          </h2>
          {awaitingConfirmation.map((inquiry) => (
            <Card
              key={inquiry.id}
              className="flex flex-col gap-3 border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">
                  {inquiry.contactName} · {tEventTypes(inquiry.eventType)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(inquiry.eventDate), "d MMM yyyy")}
                  {inquiry.eventCity ? ` · ${inquiry.eventCity}` : ""}
                </p>
              </div>
              <GateOneActions inquiryId={inquiry.id} />
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {awaitingConfirmation.length > 0 && (
          <h2 className="text-sm font-semibold text-muted-foreground">{t("title")}</h2>
        )}
        {active.length === 0 && (
          <p className="text-sm text-muted-foreground">No inquiries yet.</p>
        )}
        {active.map((inquiry) => (
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
