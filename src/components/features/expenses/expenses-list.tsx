"use client"

import { useTransition } from "react"
import { format } from "date-fns"
import { Trash2, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { deleteExpenseAction, submitExpenseAction } from "@/server/actions/expenses"

export type ExpenseData = {
  id: string
  expenseDate: string
  startLocation: string | null
  endLocation: string | null
  kilometers: string | null
  kmAllowanceEur: number | null
  otherAmountEur: number | null
  description: string | null
  status: "DRAFT" | "SUBMITTED"
  bandMemberName: string
}

export function ExpensesList({ expenses }: { expenses: ExpenseData[] }) {
  const [isPending, startTransition] = useTransition()

  if (expenses.length === 0) {
    return <p className="text-sm text-muted-foreground">No expenses logged yet.</p>
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => {
        const total = (expense.kmAllowanceEur ?? 0) + (expense.otherAmountEur ?? 0)
        return (
          <Card key={expense.id} className="flex flex-row items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium">
                {format(new Date(expense.expenseDate), "d MMM yyyy")} · {total}€
              </p>
              <p className="text-sm text-muted-foreground">
                {expense.bandMemberName}
                {expense.kilometers ? ` · ${expense.kilometers} km` : ""}
                {expense.startLocation && expense.endLocation
                  ? ` · ${expense.startLocation} → ${expense.endLocation}`
                  : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={expense.status === "SUBMITTED" ? "default" : "secondary"}>
                {expense.status}
              </Badge>
              {expense.status === "DRAFT" && (
                <>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    disabled={isPending}
                    onClick={() => startTransition(() => submitExpenseAction(expense.id))}
                  >
                    <Send className="size-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    disabled={isPending}
                    onClick={() => startTransition(() => deleteExpenseAction(expense.id))}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
