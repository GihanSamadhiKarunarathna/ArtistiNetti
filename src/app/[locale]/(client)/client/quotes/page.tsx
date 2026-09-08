import { format } from "date-fns"
import { getTranslations } from "next-intl/server"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { requireRole } from "@/lib/auth"
import { listQuotesForClient } from "@/server/services/quotes"

export default async function ClientQuotesPage() {
  const [user, t] = await Promise.all([
    requireRole("CLIENT"),
    getTranslations("clientDashboard"),
  ])
  const inquiries = await listQuotesForClient(user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {inquiries.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <p className="text-muted-foreground">{t("noQuotes")}</p>
          <Button className="mt-4" asChild>
            <Link href="/discover">{t("findArtist")}</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inquiry) => {
            const latestQuote = inquiry.quotes[0]
            return (
              <Link key={inquiry.id} href={`/client/quotes/${inquiry.id}`}>
                <Card className="flex flex-row items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/40">
                  <div>
                    <p className="font-medium">{inquiry.artistProfile.bandName}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(inquiry.eventDate), "d MMM yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {latestQuote && <span className="text-sm font-medium">{latestQuote.amountEur}€</span>}
                    <Badge>{latestQuote?.status ?? inquiry.status}</Badge>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
