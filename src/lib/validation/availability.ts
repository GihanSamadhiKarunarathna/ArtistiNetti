import { z } from "zod"
import { AVAILABILITY_TYPES } from "@/lib/constants"

export const createAvailabilitySchema = z
  .object({
    type: z.enum(AVAILABILITY_TYPES),
    title: z.string().max(120).optional(),
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    notes: z.string().max(1000).optional(),
    isPublicBusy: z.coerce.boolean().default(true),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  })

export type CreateAvailabilityFormInput = z.infer<typeof createAvailabilitySchema>
