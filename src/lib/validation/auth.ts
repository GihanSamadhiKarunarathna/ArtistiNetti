import { z } from "zod"
import { GENRES, EVENT_TYPES } from "@/lib/constants"

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password is required"),
})

export type LoginInput = z.infer<typeof loginSchema>

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")

export const registerArtistSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.email(),
    phone: z.string().min(5, "Phone number is required"),
    password: passwordSchema,
    confirmPassword: z.string(),
    bandName: z.string().min(2, "Artist / band name is required"),
    genres: z.array(z.enum(GENRES)).min(1, "Select at least one genre"),
    city: z.string().min(1, "City is required"),
    region: z.string().optional(),
    streetAddress: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().default("FI"),
    bio: z.string().max(2000).optional(),
    eventTypes: z.array(z.enum(EVENT_TYPES)).min(1, "Select at least one event type"),
    minBudgetEur: z.coerce.number().int().nonnegative().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type RegisterArtistInput = z.infer<typeof registerArtistSchema>

export const registerAgentSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.email(),
    phone: z.string().min(5, "Phone number is required"),
    password: passwordSchema,
    confirmPassword: z.string(),
    agencyName: z.string().min(2, "Agency name is required"),
    city: z.string().optional(),
    commissionPct: z.coerce.number().min(0).max(100).default(15),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type RegisterAgentInput = z.infer<typeof registerAgentSchema>
