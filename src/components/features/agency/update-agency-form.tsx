"use client"

import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FieldError } from "@/components/shared/form-error"
import { SubmitButton } from "@/components/shared/submit-button"
import { updateAgencyAction } from "@/server/actions/agency"
import type { ActionState } from "@/server/actions/auth"

export function UpdateAgencyForm({
  name,
  businessId,
}: {
  name: string
  businessId: string | null
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    updateAgencyAction,
    null,
  )
  const fieldErrors = state?.fieldErrors ?? {}

  useEffect(() => {
    if (state?.error === "saved") toast.success("Agency details updated")
  }, [state])

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="name">Agency name</Label>
        <Input id="name" name="name" defaultValue={name} required />
        <FieldError messages={fieldErrors.name} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="businessId">Business ID (Y-tunnus)</Label>
        <Input
          id="businessId"
          name="businessId"
          placeholder="1234567-8"
          defaultValue={businessId ?? ""}
        />
        <FieldError messages={fieldErrors.businessId} />
      </div>
      <div className="sm:col-span-2">
        <SubmitButton>Save</SubmitButton>
      </div>
    </form>
  )
}
