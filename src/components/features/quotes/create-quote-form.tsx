"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FieldError } from "@/components/shared/form-error"
import { SubmitButton } from "@/components/shared/submit-button"
import { createQuoteAction } from "@/server/actions/quotes"
import type { ActionState } from "@/server/actions/auth"

export function CreateQuoteForm({ inquiryId }: { inquiryId: string }) {
  const t = useTranslations("quotes")
  const action = createQuoteAction.bind(null, inquiryId)
  const [state, formAction] = useActionState<ActionState, FormData>(action, null)
  const fieldErrors = state?.fieldErrors ?? {}

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amountEur">{t("amount")}</Label>
          <Input id="amountEur" name="amountEur" type="number" min={1} required />
          <FieldError messages={fieldErrors.amountEur} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="depositEur">{t("deposit")}</Label>
          <Input id="depositEur" name="depositEur" type="number" min={0} />
          <FieldError messages={fieldErrors.depositEur} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="validUntil">{t("validUntil")}</Label>
          <Input id="validUntil" name="validUntil" type="date" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="termsText">{t("terms")}</Label>
        <Textarea id="termsText" name="termsText" rows={4} />
      </div>
      <SubmitButton>{t("sendQuote")}</SubmitButton>
    </form>
  )
}
