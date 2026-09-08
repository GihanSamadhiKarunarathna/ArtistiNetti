"use server"

import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth"
import { createQuoteSchema } from "@/lib/validation/quote"
import { acceptQuote, createQuote, declineQuote } from "@/server/services/quotes"
import type { ActionState } from "./auth"

function fieldErrorsFrom(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> }
}) {
  const { fieldErrors } = error.flatten()
  return Object.fromEntries(
    Object.entries(fieldErrors).filter(([, v]) => v && v.length > 0),
  ) as Record<string, string[]>
}

export async function createQuoteAction(
  inquiryId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("ARTIST")

  const parsed = createQuoteSchema.safeParse({
    amountEur: formData.get("amountEur"),
    depositEur: formData.get("depositEur") || undefined,
    validUntil: formData.get("validUntil") || undefined,
    termsText: formData.get("termsText") || undefined,
  })

  if (!parsed.success) {
    return { error: "validation", fieldErrors: fieldErrorsFrom(parsed.error) }
  }

  await createQuote(user.id, inquiryId, parsed.data)
  revalidatePath(`/artist/inquiries/${inquiryId}`)
  revalidatePath("/artist/inquiries")
  return null
}

export async function acceptQuoteAction(quoteId: string) {
  const user = await requireRole("CLIENT")
  await acceptQuote(quoteId, user.id)
  revalidatePath("/client/quotes")
  revalidatePath(`/client/quotes/${quoteId}`)
}

export async function declineQuoteAction(quoteId: string) {
  const user = await requireRole("CLIENT")
  await declineQuote(quoteId, user.id)
  revalidatePath("/client/quotes")
  revalidatePath(`/client/quotes/${quoteId}`)
}
