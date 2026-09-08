"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormError } from "@/components/shared/form-error"
import { SubmitButton } from "@/components/shared/submit-button"
import { loginAction, type ActionState } from "@/server/actions/auth"

export function LoginForm() {
  const t = useTranslations("auth")
  const [state, formAction] = useActionState<ActionState, FormData>(
    loginAction,
    null,
  )

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state?.error ? t("invalidCredentials") : null} />

      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" name="email" type="email" required autoFocus />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t("password")}</Label>
        <Input id="password" name="password" type="password" required />
      </div>

      <SubmitButton className="w-full">{t("loginButton")}</SubmitButton>
    </form>
  )
}
