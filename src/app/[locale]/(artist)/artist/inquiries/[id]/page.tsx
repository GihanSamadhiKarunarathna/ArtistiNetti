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
import { CreateQuoteForm } from "@/components/features/quotes/create-quote-form"
import { getInquiryForArtist } from "@/server/services/inquiries"

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
          <CardContent className="flex items-center justify-between text-sm">
            <div>
              <p>{latestQuote.amountEur}€ {latestQuote.depositEur ? `(${latestQuote.depositEur}€ deposit)` : ""}</p>
            </div>
            <Badge>{latestQuote.status}</Badge>
          </CardContent>
        </Card>
      )}

      {(!latestQuote || latestQuote.status === "DECLINED" || latestQuote.status === "WITHDRAWN") && (
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
