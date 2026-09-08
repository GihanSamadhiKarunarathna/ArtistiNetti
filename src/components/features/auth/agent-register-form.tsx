"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FieldError, FormError } from "@/components/shared/form-error"
import { SubmitButton } from "@/components/shared/submit-button"
import { registerAgentAction, type ActionState } from "@/server/actions/auth"

export function AgentRegisterForm() {
  const t = useTranslations("register")
  const tAuth = useTranslations("auth")
  const [state, formAction] = useActionState<ActionState, FormData>(
    registerAgentAction,
    null,
  )
  const fieldErrors = state?.fieldErrors ?? {}

  return (
    <form action={formAction} className="space-y-6">
      <FormError message={state?.error === "invalidCredentials" ? tAuth("invalidCredentials") : null} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">{t("fullName")}</Label>
          <Input id="fullName" name="fullName" required />
          <FieldError messages={fieldErrors.fullName} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" name="email" type="email" required />
          <FieldError
            messages={fieldErrors.email?.map((code) =>
              code === "emailTaken" ? "This email is already registered." : code,
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input id="phone" name="phone" type="tel" required />
          <FieldError messages={fieldErrors.phone} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="agencyName">{t("agencyName")}</Label>
          <Input id="agencyName" name="agencyName" required />
          <FieldError messages={fieldErrors.agencyName} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">{t("city")}</Label>
          <Input id="city" name="city" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="commissionPct">{t("commissionPct")}</Label>
          <Input
            id="commissionPct"
            name="commissionPct"
            type="number"
            min={0}
            max={100}
            step="0.5"
            defaultValue={15}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t("password")}</Label>
          <Input id="password" name="password" type="password" required />
          <FieldError messages={fieldErrors.password} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
          />
          <FieldError messages={fieldErrors.confirmPassword} />
        </div>
      </div>

      <SubmitButton size="lg" className="w-full">
        {t("submitAgent")}
      </SubmitButton>
    </form>
  )
}
