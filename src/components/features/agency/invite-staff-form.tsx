"use client"

import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FieldError } from "@/components/shared/form-error"
import { SubmitButton } from "@/components/shared/submit-button"
import { inviteAgencyStaffAction } from "@/server/actions/agency"
import type { ActionState } from "@/server/actions/auth"

export function InviteStaffForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(
    inviteAgencyStaffAction,
    null,
  )
  const fieldErrors = state?.fieldErrors ?? {}

  useEffect(() => {
    if (state?.error === "saved") toast.success("Invite sent")
  }, [state])

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <div className="space-y-1">
        <Label htmlFor="staffName" className="text-xs">Name</Label>
        <Input id="staffName" name="name" required className="w-40" />
        <FieldError messages={fieldErrors.name} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="staffEmail" className="text-xs">Email</Label>
        <Input id="staffEmail" name="email" type="email" required className="w-56" />
        <FieldError messages={fieldErrors.email} />
      </div>
      <SubmitButton variant="outline">Invite staff</SubmitButton>
    </form>
  )
}
