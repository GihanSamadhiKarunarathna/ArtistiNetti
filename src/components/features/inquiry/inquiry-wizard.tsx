"use client"

import { useActionState, useRef, useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldError, FormError } from "@/components/shared/form-error"
import { SubmitButton } from "@/components/shared/submit-button"
import { EVENT_TYPES } from "@/lib/constants"
import {
  submitInquiryAction,
  type SubmitInquiryState,
} from "@/server/actions/inquiries"

const STEPS = ["event", "contact", "review"] as const

export function InquiryWizard({
  bandSlug,
  bandName,
}: {
  bandSlug: string
  bandName: string
}) {
  const t = useTranslations("inquiry")
  const tEventTypes = useTranslations("eventTypes")
  const tCommon = useTranslations("common")
  const formRef = useRef<HTMLFormElement>(null)
  const [stepIndex, setStepIndex] = useState(0)

  const action = submitInquiryAction.bind(null, bandSlug)
  const [state, formAction] = useActionState<SubmitInquiryState, FormData>(
    action,
    null,
  )
  const fieldErrors = state?.fieldErrors ?? {}

  if (state?.success) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto size-12 text-primary" />
        <h2 className="mt-4 text-xl font-semibold">{t("successTitle")}</h2>
        <p className="mt-2 text-muted-foreground">
          {t("successBody", { bandName })}
        </p>
      </div>
    )
  }

  function goNext() {
    if (formRef.current?.reportValidity()) {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1))
    }
  }

  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0))
  }

  const step = STEPS[stepIndex]

  return (
    <div>
      <ol className="mb-8 flex items-center gap-2 text-sm">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span
              className={`flex size-6 items-center justify-center rounded-full text-xs font-medium ${
                i <= stepIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </span>
            <span className={i === stepIndex ? "font-medium" : "text-muted-foreground"}>
              {t(`step${s === "event" ? "Event" : s === "contact" ? "Contact" : "Review"}`)}
            </span>
            {i < STEPS.length - 1 && <span className="mx-1 text-muted-foreground">→</span>}
          </li>
        ))}
      </ol>

      <FormError message={state?.error === "notFound" ? tCommon("unknownError") : null} />

      <form ref={formRef} action={formAction} className="space-y-5">
        <div className={step === "event" ? "space-y-5" : "hidden"}>
          <div className="space-y-2">
            <Label htmlFor="eventType">{t("eventType")}</Label>
            <Select name="eventType" defaultValue={EVENT_TYPES[0]} required>
              <SelectTrigger id="eventType" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {tEventTypes(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="eventDate">{t("eventDate")}</Label>
              <Input id="eventDate" name="eventDate" type="date" required />
              <FieldError messages={fieldErrors.eventDate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventCity">{t("eventCity")}</Label>
              <Input id="eventCity" name="eventCity" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="guestCount">{t("guestCount")}</Label>
              <Input id="guestCount" name="guestCount" type="number" min={1} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetMinEur">{t("budgetMin")}</Label>
              <Input id="budgetMinEur" name="budgetMinEur" type="number" min={0} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetMaxEur">{t("budgetMax")}</Label>
              <Input id="budgetMaxEur" name="budgetMaxEur" type="number" min={0} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">{t("message")}</Label>
            <Textarea
              id="message"
              name="message"
              rows={4}
              placeholder={t("messagePlaceholder")}
            />
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={goNext}>
              {tCommon("next")}
            </Button>
          </div>
        </div>

        <div className={step === "contact" ? "space-y-5" : "hidden"}>
          <div className="space-y-2">
            <Label htmlFor="contactName">{t("contactName")}</Label>
            <Input
              id="contactName"
              name="contactName"
              required={step === "contact"}
            />
            <FieldError messages={fieldErrors.contactName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">{t("contactEmail")}</Label>
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              required={step === "contact"}
            />
            <FieldError messages={fieldErrors.contactEmail} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">{t("contactPhone")}</Label>
            <Input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              required={step === "contact"}
            />
            <FieldError messages={fieldErrors.contactPhone} />
          </div>
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={goBack}>
              {tCommon("back")}
            </Button>
            <Button type="button" onClick={goNext}>
              {tCommon("next")}
            </Button>
          </div>
        </div>

        <div className={step === "review" ? "space-y-5" : "hidden"}>
          <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            {t("reviewNotice", { bandName })}
          </p>
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={goBack}>
              {tCommon("back")}
            </Button>
            <SubmitButton>{t("submit")}</SubmitButton>
          </div>
        </div>
      </form>
    </div>
  )
}
