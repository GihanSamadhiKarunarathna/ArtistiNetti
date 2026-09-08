import { prisma } from "@/lib/db"

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

export async function createAvailabilityEntry(
  artistProfileId: string,
  data: CreateAvailabilityInput,
) {
  return prisma.availabilityEntry.create({
    data: { artistProfileId, ...data },
  })
}

export async function updateAvailabilityEntry(
  ownerUserId: string,
  entryId: string,
  data: Partial<CreateAvailabilityInput>,
) {
  const entry = await prisma.availabilityEntry.findUniqueOrThrow({
    where: { id: entryId },
    include: { artistProfile: { select: { ownerUserId: true } } },
  })
  if (entry.artistProfile.ownerUserId !== ownerUserId) throw new Error("FORBIDDEN")

  return prisma.availabilityEntry.update({ where: { id: entryId }, data })
}

export async function deleteAvailabilityEntry(ownerUserId: string, entryId: string) {
  const entry = await prisma.availabilityEntry.findUniqueOrThrow({
    where: { id: entryId },
    include: { artistProfile: { select: { ownerUserId: true } } },
  })
  if (entry.artistProfile.ownerUserId !== ownerUserId) throw new Error("FORBIDDEN")

  await prisma.availabilityEntry.delete({ where: { id: entryId } })
}
