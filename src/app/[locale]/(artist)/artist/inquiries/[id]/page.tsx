import { format } from "date-fns"
import { MessageSquare } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Link } from "@/i18n/navigation"
import { requireRole } from "@/lib/auth"
import { CreateQuoteForm } from "@/components/features/quotes/create-quote-form"
import { GateTwoActions } from "@/components/features/quotes/gate-two-actions"
import { PayoutBreakdownCard } from "@/components/features/payouts/payout-breakdown-card"
import { getInquiryForArtist } from "@/server/services/inquiries"
import { getPayoutBreakdown } from "@/server/services/payouts"

const NEEDS_NEW_QUOTE_STATUSES = new Set(["DECLINED", "WITHDRAWN", "DRAFT"])

export default async function ArtistInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [user, t, tEventTypes, tQuotes] = await Promise.all([
    requireRole("ARTIST"),
    getTranslations("inquiries"),
    getTranslations("eventTypes"),
    getTranslations("quotes"),
  ])
  const inquiry = await getInquiryForArtist(user.id, id)
  const latestQuote = inquiry.quotes[0]
  const payoutBreakdown =
    latestQuote?.status === "ACCEPTED"
      ? await getPayoutBreakdown(inquiry.artistProfileId, latestQuote.id)
      : null

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{inquiry.contactName}</h1>
        {inquiry.gigThread && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/artist/messages/${inquiry.gigThread.id}`}>
              <MessageSquare />
              {t("openThread")}
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("eventDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <p><span className="text-muted-foreground">Type:</span> {tEventTypes(inquiry.eventType)}</p>
          <p><span className="text-muted-foreground">Date:</span> {format(new Date(inquiry.eventDate), "d MMM yyyy")}</p>
          {inquiry.eventCity && <p><span className="text-muted-foreground">City:</span> {inquiry.eventCity}</p>}
          {inquiry.guestCount && <p><span className="text-muted-foreground">Guests:</span> {inquiry.guestCount}</p>}
          {(inquiry.budgetMinEur || inquiry.budgetMaxEur) && (
            <p>
              <span className="text-muted-foreground">Budget:</span>{" "}
              {inquiry.budgetMinEur ?? "?"}€ – {inquiry.budgetMaxEur ?? "?"}€
            </p>
          )}
          {inquiry.message && (
            <p className="sm:col-span-2 whitespace-pre-line">
              <span className="text-muted-foreground">Message:</span> {inquiry.message}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("contactDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <p><span className="text-muted-foreground">Name:</span> {inquiry.contactName}</p>
          <p><span className="text-muted-foreground">Email:</span> {inquiry.contactEmail}</p>
          {inquiry.contactPhone && <p><span className="text-muted-foreground">Phone:</span> {inquiry.contactPhone}</p>}
        </CardContent>
      </Card>

      {latestQuote && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{tQuotes("title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <p>{latestQuote.amountEur}€ {latestQuote.depositEur ? `(${latestQuote.depositEur}€ deposit)` : ""}</p>
              <Badge>{latestQuote.status}</Badge>
            </div>

            {latestQuote.status === "AWAITING_ARTIST_APPROVAL" && (
              <>
                <Alert>
                  <AlertDescription>
                    Your agency drafted this quote — review it before it goes to the client.
                  </AlertDescription>
                </Alert>
                <GateTwoActions quoteId={latestQuote.id} />
              </>
            )}

            {latestQuote.status === "DRAFT" && latestQuote.artistRejectionNote && (
              <Alert variant="destructive">
                <AlertDescription>
                  You sent this back for revision: &ldquo;{latestQuote.artistRejectionNote}&rdquo;
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {payoutBreakdown && <PayoutBreakdownCard breakdown={payoutBreakdown} />}

      {(!latestQuote || NEEDS_NEW_QUOTE_STATUSES.has(latestQuote.status)) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{tQuotes("createTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateQuoteForm inquiryId={inquiry.id} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
