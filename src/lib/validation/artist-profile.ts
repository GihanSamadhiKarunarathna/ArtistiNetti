import { z } from "zod"
import { GENRES, EVENT_TYPES } from "@/lib/constants"

const optionalUrl = z
  .union([z.url(), z.literal("")])
  .optional()
  .transform((v) => (v ? v : undefined))

export const updateArtistProfileSchema = z.object({
  bandName: z.string().min(2, "Artist / band name is required"),
  bio: z.string().max(2000).optional(),
  bioEn: z.string().max(2000).optional(),
  genres: z.array(z.enum(GENRES)).min(1, "Select at least one genre"),
  eventTypes: z.array(z.enum(EVENT_TYPES)).min(1, "Select at least one event type"),
  city: z.string().min(1, "City is required"),
  region: z.string().optional(),
  minBudgetEur: z.coerce.number().int().nonnegative().optional(),
  maxBudgetEur: z.coerce.number().int().nonnegative().optional(),
  spotifyUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  websiteUrl: optionalUrl,
  instagramUrl: optionalUrl,
})

export type UpdateArtistProfileInput = z.infer<typeof updateArtistProfileSchema>

export const addBandMemberSchema = z.object({
  displayName: z.string().min(1, "Name is required"),
  instrument: z.string().max(80).optional(),
  payoutSharePct: z.coerce.number().min(0).max(100).optional(),
})

export type AddBandMemberInput = z.infer<typeof addBandMemberSchema>
