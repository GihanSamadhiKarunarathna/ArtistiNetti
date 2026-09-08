"use client"

import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { FieldError } from "@/components/shared/form-error"
import { SubmitButton } from "@/components/shared/submit-button"
import { GENRES, EVENT_TYPES } from "@/lib/constants"
import {
  updateArtistProfileAction,
} from "@/server/actions/artist-profile"
import type { ActionState } from "@/server/actions/auth"

export type ArtistProfileFormData = {
  bandName: string
  bio: string | null
  bioEn: string | null
  genres: string[]
  eventTypes: string[]
  city: string | null
  region: string | null
  minBudgetEur: number | null
  maxBudgetEur: number | null
  spotifyUrl: string | null
  youtubeUrl: string | null
  websiteUrl: string | null
  instagramUrl: string | null
}

export function ArtistProfileForm({ profile }: { profile: ArtistProfileFormData }) {
  const t = useTranslations("register")
  const tCommon = useTranslations("common")
  const tArtist = useTranslations("artistDashboard")
  const tGenres = useTranslations("genres")
  const tEventTypes = useTranslations("eventTypes")
  const [state, formAction] = useActionState<ActionState, FormData>(
    updateArtistProfileAction,
    null,
  )
  const fieldErrors = state?.fieldErrors ?? {}

  useEffect(() => {
    if (state?.error === "saved") toast.success("Profile updated")
  }, [state])

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="bandName">{t("bandName")}</Label>
          <Input id="bandName" name="bandName" defaultValue={profile.bandName} required />
          <FieldError messages={fieldErrors.bandName} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">{t("city")}</Label>
          <Input id="city" name="city" defaultValue={profile.city ?? ""} required />
          <FieldError messages={fieldErrors.city} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="region">{t("region")}</Label>
          <Input id="region" name="region" defaultValue={profile.region ?? ""} />
        </div>
        <div />
        <div className="space-y-2">
          <Label htmlFor="minBudgetEur">{t("minBudget")}</Label>
          <Input
            id="minBudgetEur"
            name="minBudgetEur"
            type="number"
            min={0}
            defaultValue={profile.minBudgetEur ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxBudgetEur">Maximum price (EUR)</Label>
          <Input
            id="maxBudgetEur"
            name="maxBudgetEur"
            type="number"
            min={0}
            defaultValue={profile.maxBudgetEur ?? ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">{t("bio")} (Suomi)</Label>
        <Textarea id="bio" name="bio" rows={4} maxLength={2000} defaultValue={profile.bio ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bioEn">{t("bio")} (English)</Label>
        <Textarea id="bioEn" name="bioEn" rows={4} maxLength={2000} defaultValue={profile.bioEn ?? ""} />
      </div>

      <div className="space-y-2">
        <Label>{t("genres")}</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {GENRES.map((genre) => (
            <label
              key={genre}
              className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
            >
              <Checkbox
                name="genres"
                value={genre}
                defaultChecked={profile.genres.includes(genre)}
              />
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
              <Checkbox
                name="eventTypes"
                value={type}
                defaultChecked={profile.eventTypes.includes(type)}
              />
              {tEventTypes(type)}
            </label>
          ))}
        </div>
        <FieldError messages={fieldErrors.eventTypes} />
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-medium">{tArtist("mediaSection")}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="spotifyUrl">{tArtist("spotifyUrl")}</Label>
            <Input
              id="spotifyUrl"
              name="spotifyUrl"
              type="url"
              placeholder="https://open.spotify.com/..."
              defaultValue={profile.spotifyUrl ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtubeUrl">{tArtist("youtubeUrl")}</Label>
            <Input
              id="youtubeUrl"
              name="youtubeUrl"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              defaultValue={profile.youtubeUrl ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website</Label>
            <Input id="websiteUrl" name="websiteUrl" type="url" defaultValue={profile.websiteUrl ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagramUrl">Instagram</Label>
            <Input id="instagramUrl" name="instagramUrl" type="url" defaultValue={profile.instagramUrl ?? ""} />
          </div>
        </div>
      </div>

      <SubmitButton>{tCommon("save")}</SubmitButton>
    </form>
  )
}
