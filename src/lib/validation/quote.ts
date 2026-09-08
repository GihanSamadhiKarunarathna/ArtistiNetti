import { z } from "zod"

export const createQuoteSchema = z
  .object({
    amountEur: z.coerce.number().int().positive("Amount must be greater than 0"),
    depositEur: z.coerce.number().int().nonnegative().optional(),
    validUntil: z.iso.date().optional(),
    termsText: z.string().max(4000).optional(),
  })
  .refine(
    (data) => data.depositEur === undefined || data.depositEur <= data.amountEur,
    { message: "Deposit cannot exceed the total amount", path: ["depositEur"] },
  )

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>
