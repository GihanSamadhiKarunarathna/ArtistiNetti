import { z } from "zod"
import { EVENT_TYPES } from "@/lib/constants"

export const createInquirySchema = z.object({
  eventType: z.enum(EVENT_TYPES),
  eventDate: z.iso.date(),
  eventCity: z.string().max(120).optional(),
  guestCount: z.coerce.number().int().positive().optional(),
  budgetMinEur: z.coerce.number().int().nonnegative().optional(),
  budgetMaxEur: z.coerce.number().int().nonnegative().optional(),
  message: z.string().max(2000).optional(),
  contactName: z.string().min(2, "Full name is required"),
  contactEmail: z.email(),
  contactPhone: z.string().min(5, "Phone number is required"),
})

export type CreateInquiryFormInput = z.infer<typeof createInquirySchema>
