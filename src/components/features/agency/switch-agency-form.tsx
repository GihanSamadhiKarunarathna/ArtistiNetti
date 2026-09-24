"use client"

import { useActionState, useEffect, useTransition } from "react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/shared/form-error"
import { SubmitButton } from "@/components/shared/submit-button"
import { revertToSelfManagedAction, switchAgencyAction } from "@/server/actions/agency"
import type { ActionState } from "@/server/actions/auth"

const ERROR_MESSAGES: Record<string, string> = {
  agencyNotFound: "No agency found with that Business ID.",
  alreadyRepresented: "You're already represented by that agency.",
}

export function SwitchAgencyForm({ isSelfManaged }: { isSelfManaged: boolean }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    switchAgencyAction,
    null,
  )
  const [isPending, startTransition] = useTransition()
  const fieldErrors = state?.fieldErrors ?? {}

  useEffect(() => {
    if (state?.error === "saved") toast.success("Agency representation updated")
  }, [state])

  return (
    <div className="space-y-4">
      <form action={formAction} className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <Label htmlFor="businessId" className="text-xs">Agency Business ID</Label>
          <Input
            id="businessId"
            name="businessId"
            placeholder="1234567-8"
            className="w-44"
            required
          />
          <FieldError messages={fieldErrors.businessId} />
        </div>
        <SubmitButton variant="outline">Switch agency</SubmitButton>
      </form>
      {state?.error && ERROR_MESSAGES[state.error] && (
        <p className="text-sm text-destructive">{ERROR_MESSAGES[state.error]}</p>
      )}

      {!isSelfManaged && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await revertToSelfManagedAction()
              toast.success("Reverted to self-managed")
            })
          }
        >
          Revert to self-managed
        </Button>
      )}
    </div>
  )
}
