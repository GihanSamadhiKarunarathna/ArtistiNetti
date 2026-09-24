import { format } from "date-fns"
import { getTranslations } from "next-intl/server"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Link } from "@/i18n/navigation"
import { requireRole } from "@/lib/auth"
import { getArtistForAgent } from "@/server/services/agent"
import { listInquiriesForArtist } from "@/server/services/inquiries"
import { listExpensesForArtist } from "@/server/services/expenses"

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
  const allInquiries = await listInquiriesForArtist(artist.id)
  // Gate 1 hasn't happened yet — nothing for the agency to act on.
  const inquiries = allInquiries.filter((i) => i.status !== "AWAITING_ARTIST_CONFIRMATION")
  const expenses = await listExpensesForArtist(artist.id)
  const submittedExpenses = expenses.filter((e) => e.status === "SUBMITTED")

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
          <Link key={inquiry.id} href={`/agent/artists/${artist.id}/inquiries/${inquiry.id}`}>
            <Card className="flex flex-row items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/40">
              <div>
                <p className="font-medium">
                  {inquiry.contactName} · {tEventTypes(inquiry.eventType)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(inquiry.eventDate), "d MMM yyyy")}
                </p>
              </div>
              <Badge>{inquiry.status}</Badge>
            </Card>
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="font-medium">Submitted travel expenses</h2>
        {submittedExpenses.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No submitted expenses yet — for invoicing reference only.
          </p>
        )}
        {submittedExpenses.map((expense) => {
          const total = (expense.kmAllowanceEur ?? 0) + (expense.otherAmountEur ?? 0)
          return (
            <Card key={expense.id} className="flex flex-row items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium">
                  {format(new Date(expense.expenseDate), "d MMM yyyy")} · {total}€
                </p>
                <p className="text-sm text-muted-foreground">
                  {expense.bandMember.displayName}
                  {expense.kilometers ? ` · ${expense.kilometers.toString()} km` : ""}
                </p>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
