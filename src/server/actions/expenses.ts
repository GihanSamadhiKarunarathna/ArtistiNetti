"use server"

import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth"
import { createExpenseSchema } from "@/lib/validation/expenses"
import { createExpense, deleteExpense, submitExpense } from "@/server/services/expenses"
import type { ActionState } from "./auth"

function fieldErrorsFrom(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> }
}) {
  const { fieldErrors } = error.flatten()
  return Object.fromEntries(
    Object.entries(fieldErrors).filter(([, v]) => v && v.length > 0),
  ) as Record<string, string[]>
}

export async function createExpenseAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("ARTIST")

  const parsed = createExpenseSchema.safeParse({
    expenseDate: formData.get("expenseDate"),
    startLocation: formData.get("startLocation") || undefined,
    endLocation: formData.get("endLocation") || undefined,
    kilometers: formData.get("kilometers") || undefined,
    otherAmountEur: formData.get("otherAmountEur") || undefined,
    description: formData.get("description") || undefined,
  })

  if (!parsed.success) {
    return { error: "validation", fieldErrors: fieldErrorsFrom(parsed.error) }
  }

  await createExpense(user.id, parsed.data)
  revalidatePath("/artist/expenses")
  return null
}

export async function submitExpenseAction(expenseId: string) {
  const user = await requireRole("ARTIST")
  await submitExpense(user.id, expenseId)
  revalidatePath("/artist/expenses")
}

export async function deleteExpenseAction(expenseId: string) {
  const user = await requireRole("ARTIST")
  await deleteExpense(user.id, expenseId)
  revalidatePath("/artist/expenses")
}
