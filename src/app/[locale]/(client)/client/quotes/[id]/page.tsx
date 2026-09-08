import { format } from "date-fns"
import { MessageSquare } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Link } from "@/i18n/navigation"
import { requireRole } from "@/lib/auth"
import { QuoteAcceptCard } from "@/components/features/quotes/quote-accept-card"
import { getInquiryForClient } from "@/server/services/inquiries"

export default async function ClientQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [user, t, tEventTypes] = await Promise.all([
    requireRole("CLIENT"),
    getTranslations("inquiries"),
    getTranslations("eventTypes"),
  ])
  const inquiry = await getInquiryForClient(user.id, id)
  const latestQuote = inquiry.quotes[0]

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{inquiry.artistProfile.bandName}</h1>
        {inquiry.gigThread && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/client/messages/${inquiry.gigThread.id}`}>
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
          <Badge className="w-fit">{inquiry.status}</Badge>
        </CardContent>
      </Card>

      {latestQuote ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quote from {inquiry.artistProfile.bandName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold">{latestQuote.amountEur}€</p>
                {latestQuote.depositEur && (
                  <p className="text-sm text-muted-foreground">
                    {latestQuote.depositEur}€ deposit to confirm
                  </p>
                )}
              </div>
              <Badge>{latestQuote.status}</Badge>
            </div>
            {latestQuote.termsText && (
              <p className="whitespace-pre-line text-sm text-muted-foreground">
                {latestQuote.termsText}
              </p>
            )}
            {latestQuote.status === "SENT" && (
              <QuoteAcceptCard
                quoteId={latestQuote.id}
                amountEur={latestQuote.amountEur}
                depositEur={latestQuote.depositEur}
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">
          No quote yet — the artist will respond to your request soon.
        </p>
      )}
    </div>
  )
}
