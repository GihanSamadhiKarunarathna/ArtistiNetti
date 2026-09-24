"use client"

import { useActionState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FieldError, FormError } from "@/components/shared/form-error"
import { SubmitButton } from "@/components/shared/submit-button"
import type { AcceptInviteState } from "@/server/actions/agency"

export function AcceptInviteForm({
  action,
}: {
  action: (
    prevState: AcceptInviteState,
    formData: FormData,
  ) => Promise<AcceptInviteState>
}) {
  const [state, formAction] = useActionState<AcceptInviteState, FormData>(
    action,
    null,
  )
  const router = useRouter()
  const fieldErrors = state?.fieldErrors ?? {}

  const ERROR_MESSAGES: Record<string, string> = {
    alreadyAccepted: "This invite has already been used.",
    expired: "This invite has expired. Ask for a new one.",
  }

  useEffect(() => {
    if (state?.success) router.push("/login")
  }, [state, router])

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state?.error ? (ERROR_MESSAGES[state.error] ?? null) : null} />
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
        <FieldError messages={fieldErrors.password} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required />
        <FieldError messages={fieldErrors.confirmPassword} />
      </div>
      <SubmitButton className="w-full">Create account</SubmitButton>
    </form>
  )
}
