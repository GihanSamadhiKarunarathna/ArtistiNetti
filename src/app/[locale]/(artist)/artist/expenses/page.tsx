import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireRole } from "@/lib/auth"
import { ExpenseForm } from "@/components/features/expenses/expense-form"
import { ExpensesList } from "@/components/features/expenses/expenses-list"
import { getArtistProfileForMember } from "@/server/services/artist-profile"
import { listExpensesForArtist } from "@/server/services/expenses"

export default async function ArtistExpensesPage() {
  const user = await requireRole("ARTIST")
  const profile = await getArtistProfileForMember(user.id)
  const expenses = await listExpensesForArtist(profile.id)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Travel expenses</h1>
        <p className="text-muted-foreground">
          Log mileage and other gig-related costs — no approval needed, submit them directly.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Log a new expense</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseForm />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="font-medium">History</h2>
        <ExpensesList
          expenses={expenses.map((e) => ({
            id: e.id,
            expenseDate: e.expenseDate.toISOString(),
            startLocation: e.startLocation,
            endLocation: e.endLocation,
            kilometers: e.kilometers ? e.kilometers.toString() : null,
            kmAllowanceEur: e.kmAllowanceEur,
            otherAmountEur: e.otherAmountEur,
            description: e.description,
            status: e.status,
            bandMemberName: e.bandMember.displayName,
          }))}
        />
      </div>
    </div>
  )
}
