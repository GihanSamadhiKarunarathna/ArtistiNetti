import { prisma } from "@/lib/db"
import { calculateKmAllowanceEur } from "@/lib/finnish-tax"
import { getArtistProfileForMember } from "@/server/services/artist-profile"
import type { CreateExpenseInput } from "@/lib/validation/expenses"

export async function listExpensesForArtist(artistProfileId: string) {
  return prisma.travelExpense.findMany({
    where: { artistProfileId },
    orderBy: { expenseDate: "desc" },
    include: { bandMember: { select: { displayName: true } } },
  })
}

/** Logs a new expense as a draft for the calling member — no approval needed to submit later. */
export async function createExpense(userId: string, data: CreateExpenseInput) {
  const profile = await getArtistProfileForMember(userId)
  if (!profile.membership) throw new Error("FORBIDDEN")
  if (!profile.membership.canLogExpenses) throw new Error("FORBIDDEN")

  const kmAllowanceEur = data.kilometers
    ? calculateKmAllowanceEur(data.kilometers)
    : undefined

  return prisma.travelExpense.create({
    data: {
      artistProfileId: profile.id,
      bandMemberId: profile.membership.id,
      expenseDate: new Date(data.expenseDate),
      startLocation: data.startLocation,
      endLocation: data.endLocation,
      kilometers: data.kilometers,
      kmAllowanceEur,
      otherAmountEur: data.otherAmountEur,
      description: data.description,
      availabilityEntryId: data.availabilityEntryId || undefined,
    },
  })
}

/** Direct sign-off: the member submits their own draft, no agent approval step. */
export async function submitExpense(userId: string, expenseId: string) {
  const profile = await getArtistProfileForMember(userId)
  const expense = await prisma.travelExpense.findUniqueOrThrow({
    where: { id: expenseId },
  })
  if (expense.bandMemberId !== profile.membership?.id) throw new Error("FORBIDDEN")
  if (expense.status !== "DRAFT") throw new Error("INVALID_STATE")

  return prisma.travelExpense.update({
    where: { id: expenseId },
    data: { status: "SUBMITTED" },
  })
}

export async function deleteExpense(userId: string, expenseId: string) {
  const profile = await getArtistProfileForMember(userId)
  const expense = await prisma.travelExpense.findUniqueOrThrow({
    where: { id: expenseId },
  })
  if (expense.bandMemberId !== profile.membership?.id) throw new Error("FORBIDDEN")
  if (expense.status !== "DRAFT") throw new Error("INVALID_STATE")

  await prisma.travelExpense.delete({ where: { id: expenseId } })
}
