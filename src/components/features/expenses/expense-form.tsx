"use client"

import { useActionState, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FieldError } from "@/components/shared/form-error"
import { SubmitButton } from "@/components/shared/submit-button"
import { FINNISH_KM_ALLOWANCE_EUR_PER_KM } from "@/lib/finnish-tax"
import { createExpenseAction } from "@/server/actions/expenses"
import type { ActionState } from "@/server/actions/auth"

export function ExpenseForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(
    createExpenseAction,
    null,
  )
  const fieldErrors = state?.fieldErrors ?? {}
  const [kilometers, setKilometers] = useState("")

  const estimatedAllowance = useMemo(() => {
    const km = Number(kilometers)
    if (!km || Number.isNaN(km)) return null
    return Math.round(km * FINNISH_KM_ALLOWANCE_EUR_PER_KM)
  }, [kilometers])

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="expenseDate">Date</Label>
          <Input id="expenseDate" name="expenseDate" type="date" required />
          <FieldError messages={fieldErrors.expenseDate} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kilometers">Kilometers driven</Label>
          <Input
            id="kilometers"
            name="kilometers"
            type="number"
            min={0}
            step="0.1"
            value={kilometers}
            onChange={(e) => setKilometers(e.target.value)}
          />
          {estimatedAllowance != null && (
            <p className="text-xs text-muted-foreground">
              Estimated allowance: {estimatedAllowance}€ (
              {FINNISH_KM_ALLOWANCE_EUR_PER_KM}€/km)
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="startLocation">Start location</Label>
          <Input id="startLocation" name="startLocation" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endLocation">End location</Label>
          <Input id="endLocation" name="endLocation" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="otherAmountEur">Other costs (EUR)</Label>
          <Input id="otherAmountEur" name="otherAmountEur" type="number" min={0} />
          <p className="text-xs text-muted-foreground">Per diems, receipts, etc.</p>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Notes</Label>
        <Textarea id="description" name="description" rows={3} />
      </div>
      <SubmitButton>Log expense</SubmitButton>
    </form>
  )
}
