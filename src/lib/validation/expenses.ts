import { z } from "zod"

export const createExpenseSchema = z.object({
  expenseDate: z.iso.date(),
  startLocation: z.string().max(200).optional(),
  endLocation: z.string().max(200).optional(),
  kilometers: z.coerce.number().nonnegative().optional(),
  otherAmountEur: z.coerce.number().int().nonnegative().optional(),
  description: z.string().max(1000).optional(),
  availabilityEntryId: z.string().optional(),
})

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
