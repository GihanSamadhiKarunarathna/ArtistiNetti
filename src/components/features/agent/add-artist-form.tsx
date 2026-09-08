"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { FormError } from "@/components/shared/form-error"
import { SubmitButton } from "@/components/shared/submit-button"
import { addArtistByEmailAction } from "@/server/actions/agent"
import type { ActionState } from "@/server/actions/auth"

const ERROR_MESSAGES: Record<string, string> = {
  artistNotFound: "No artist account found with that email.",
  alreadyManaged: "That artist is already managed by an agent.",
  validation: "Please enter an email address.",
}

export function AddArtistForm() {
  const t = useTranslations("agentDashboard")
  const [state, formAction] = useActionState<ActionState, FormData>(
    addArtistByEmailAction,
    null,
  )

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <div className="flex-1 space-y-1.5">
        <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
          Artist&apos;s account email
        </label>
        <Input id="email" name="email" type="email" required placeholder="artist@example.com" />
      </div>
      <SubmitButton variant="outline">{t("addArtist")}</SubmitButton>
      {state?.error && (
        <div className="w-full">
          <FormError message={ERROR_MESSAGES[state.error] ?? null} />
        </div>
      )}
    </form>
  )
}
