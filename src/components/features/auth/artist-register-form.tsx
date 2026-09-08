"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { FieldError, FormError } from "@/components/shared/form-error"
import { SubmitButton } from "@/components/shared/submit-button"
import { GENRES, EVENT_TYPES } from "@/lib/constants"
import {
  registerArtistAction,
  type ActionState,
} from "@/server/actions/auth"

export function ArtistRegisterForm() {
  const t = useTranslations("register")
  const tGenres = useTranslations("genres")
  const tEventTypes = useTranslations("eventTypes")
  const tAuth = useTranslations("auth")
  const [state, formAction] = useActionState<ActionState, FormData>(
    registerArtistAction,
    null,
  )
  const fieldErrors = state?.fieldErrors ?? {}

  return (
    <form action={formAction} className="space-y-8">
      <FormError message={state?.error === "invalidCredentials" ? tAuth("invalidCredentials") : null} />

      <section className="space-y-4">
        <h2 className="text-lg font-medium">{t("sectionAccount")}</h2>
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
              messages={
                fieldErrors.email?.map((code) =>
                  code === "emailTaken" ? "This email is already registered." : code,
                )
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t("phone")}</Label>
            <Input id="phone" name="phone" type="tel" required />
            <FieldError messages={fieldErrors.phone} />
          </div>
          <div />
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
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-lg font-medium">{t("sectionBand")}</h2>
        <div className="space-y-2">
          <Label htmlFor="bandName">{t("bandName")}</Label>
          <Input id="bandName" name="bandName" required />
          <FieldError messages={fieldErrors.bandName} />
        </div>

        <div className="space-y-2">
          <Label>{t("genres")}</Label>
          <p className="text-sm text-muted-foreground">{t("genresHelp")}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {GENRES.map((genre) => (
              <label
                key={genre}
                className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
              >
                <Checkbox name="genres" value={genre} />
                {tGenres(genre)}
              </label>
            ))}
          </div>
          <FieldError messages={fieldErrors.genres} />
        </div>

        <div className="space-y-2">
          <Label>{t("eventTypes")}</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {EVENT_TYPES.map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
              >
                <Checkbox name="eventTypes" value={type} />
                {tEventTypes(type)}
              </label>
            ))}
          </div>
          <FieldError messages={fieldErrors.eventTypes} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">{t("bio")}</Label>
          <p className="text-sm text-muted-foreground">{t("bioHelp")}</p>
          <Textarea id="bio" name="bio" rows={4} maxLength={2000} />
        </div>

        <div className="space-y-2 sm:max-w-xs">
          <Label htmlFor="minBudgetEur">{t("minBudget")}</Label>
          <Input id="minBudgetEur" name="minBudgetEur" type="number" min={0} />
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-lg font-medium">{t("sectionAddress")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="streetAddress">{t("streetAddress")}</Label>
            <Input id="streetAddress" name="streetAddress" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">{t("postalCode")}</Label>
            <Input id="postalCode" name="postalCode" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">{t("city")}</Label>
            <Input id="city" name="city" required />
            <FieldError messages={fieldErrors.city} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="region">{t("region")}</Label>
            <Input id="region" name="region" />
          </div>
          <input type="hidden" name="country" value="FI" />
        </div>
      </section>

      <SubmitButton size="lg" className="w-full">
        {t("submitArtist")}
      </SubmitButton>
    </form>
  )
}
