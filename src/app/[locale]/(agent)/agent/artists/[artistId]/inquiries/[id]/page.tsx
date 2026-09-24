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
import { getInquiryForAgent } from "@/server/services/inquiries"

const NEEDS_NEW_QUOTE_STATUSES = new Set(["DECLINED", "WITHDRAWN", "DRAFT"])

export default async function AgentInquiryDetailPage({
  params,
}: {
  params: Promise<{ artistId: string; id: string }>
}) {
  const { id } = await params
  const [user, t, tEventTypes, tQuotes] = await Promise.all([
    requireRole("AGENT"),
    getTranslations("inquiries"),
    getTranslations("eventTypes"),
    getTranslations("quotes"),
  ])
  const inquiry = await getInquiryForAgent(user.id, id)
  const latestQuote = inquiry.quotes[0]

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{inquiry.contactName}</h1>
        {inquiry.gigThread && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/agent/messages/${inquiry.gigThread.id}`}>
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
          {inquiry.message && (
            <p className="sm:col-span-2 whitespace-pre-line">
              <span className="text-muted-foreground">Message:</span> {inquiry.message}
            </p>
          )}
        </CardContent>
      </Card>

      {latestQuote && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{tQuotes("title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <p>{latestQuote.amountEur}€ {latestQuote.depositEur ? `(${latestQuote.depositEur}€ deposit)` : ""}</p>
              <Badge>{latestQuote.status}</Badge>
            </div>
            {latestQuote.status === "AWAITING_ARTIST_APPROVAL" && (
              <Alert>
                <AlertDescription>Waiting for the band to approve this quote.</AlertDescription>
              </Alert>
            )}
            {latestQuote.status === "DRAFT" && latestQuote.artistRejectionNote && (
              <Alert variant="destructive">
                <AlertDescription>
                  The band sent this back: &ldquo;{latestQuote.artistRejectionNote}&rdquo; — revise and resubmit below.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

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
