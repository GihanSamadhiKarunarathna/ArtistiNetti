import { prisma } from "@/lib/db"
import { assertArtistAccess } from "@/server/services/artist-profile"

export async function listPublicBusyDates(artistProfileId: string) {
  return prisma.availabilityEntry.findMany({
    where: { artistProfileId, isPublicBusy: true, endDate: { gte: new Date() } },
    select: { startDate: true, endDate: true },
    orderBy: { startDate: "asc" },
  })
}

export async function listAvailability(artistProfileId: string) {
  return prisma.availabilityEntry.findMany({
    where: { artistProfileId },
    orderBy: { startDate: "asc" },
  })
}

export async function countUpcomingGigs(artistProfileId: string) {
  return prisma.availabilityEntry.count({
    where: {
      artistProfileId,
      type: "CONFIRMED_GIG",
      startDate: { gte: new Date() },
    },
  })
}

export type CreateAvailabilityInput = {
  type: "CONFIRMED_GIG" | "HOLD" | "BLOCKED" | "PENDING_QUOTE"
  title?: string
  startDate: Date
  endDate: Date
  notes?: string
  isPublicBusy: boolean
}

const BLOCKING_TYPES = ["CONFIRMED_GIG", "BLOCKED"] as const

/**
 * Smart conflict prevention: a new confirmed/blocked entry can't overlap an
 * existing confirmed/blocked entry for the same band. Holds and pending-quote
 * markers don't block each other — only firm commitments do.
 */
async function assertNoConflict(
  artistProfileId: string,
  type: CreateAvailabilityInput["type"],
  startDate: Date,
  endDate: Date,
  excludeEntryId?: string,
) {
  if (!(BLOCKING_TYPES as readonly string[]).includes(type)) return

  const overlapping = await prisma.availabilityEntry.findFirst({
    where: {
      artistProfileId,
      id: excludeEntryId ? { not: excludeEntryId } : undefined,
      type: { in: [...BLOCKING_TYPES] },
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
  })
  if (overlapping) throw new Error("DATE_CONFLICT")
}

export async function createAvailabilityEntry(
  artistProfileId: string,
  data: CreateAvailabilityInput,
) {
  await assertNoConflict(artistProfileId, data.type, data.startDate, data.endDate)
  return prisma.availabilityEntry.create({
    data: { artistProfileId, ...data },
  })
}

export async function updateAvailabilityEntry(
  userId: string,
  entryId: string,
  data: Partial<CreateAvailabilityInput>,
) {
  const entry = await prisma.availabilityEntry.findUniqueOrThrow({
    where: { id: entryId },
  })
  await assertArtistAccess(userId, entry.artistProfileId)

  if (data.type && data.startDate && data.endDate) {
    await assertNoConflict(
      entry.artistProfileId,
      data.type,
      data.startDate,
      data.endDate,
      entryId,
    )
  }

  return prisma.availabilityEntry.update({ where: { id: entryId }, data })
}

export async function deleteAvailabilityEntry(userId: string, entryId: string) {
  const entry = await prisma.availabilityEntry.findUniqueOrThrow({
    where: { id: entryId },
  })
  await assertArtistAccess(userId, entry.artistProfileId)

  await prisma.availabilityEntry.delete({ where: { id: entryId } })
}
