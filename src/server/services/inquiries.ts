import { prisma } from "@/lib/db"
import type { EventTypeValue } from "@/lib/constants"
import { assertArtistAccess } from "@/server/services/artist-profile"
import { createAvailabilityEntry } from "@/server/services/availability"

/** Inquiries that are still hidden from the client (pre-Gate-1, or silently declined at Gate 1). */
export const CLIENT_HIDDEN_STATUSES = ["AWAITING_ARTIST_CONFIRMATION", "CANCELLED"] as const

export async function countInquiriesByStatus(
  artistProfileId: string,
  status: string,
) {
  return prisma.inquiryRequest.count({
    where: { artistProfileId, status: status as never },
  })
}

export async function listInquiriesForArtist(artistProfileId: string) {
  return prisma.inquiryRequest.findMany({
    where: { artistProfileId },
    orderBy: { createdAt: "desc" },
    include: {
      quotes: { orderBy: { createdAt: "desc" }, take: 1 },
      gigThread: { select: { id: true } },
    },
  })
}

export async function getInquiryForArtist(userId: string, inquiryId: string) {
  const inquiry = await prisma.inquiryRequest.findUniqueOrThrow({
    where: { id: inquiryId },
    include: {
      artistProfile: {
        select: { id: true, bandName: true, agencyId: true, ownAgencyId: true },
      },
      quotes: { orderBy: { createdAt: "desc" } },
      gigThread: true,
    },
  })
  await assertArtistAccess(userId, inquiry.artistProfileId)
  return inquiry
}

export async function getInquiryForAgent(agentUserId: string, inquiryId: string) {
  const agentProfile = await prisma.agentProfile.findUniqueOrThrow({
    where: { userId: agentUserId },
  })
  const inquiry = await prisma.inquiryRequest.findUniqueOrThrow({
    where: { id: inquiryId },
    include: {
      artistProfile: { select: { id: true, bandName: true, agencyId: true } },
      quotes: { orderBy: { createdAt: "desc" } },
      gigThread: true,
    },
  })
  if (inquiry.artistProfile.agencyId !== agentProfile.agencyId) {
    throw new Error("FORBIDDEN")
  }
  return inquiry
}

export async function getInquiryForClient(
  clientUserId: string,
  inquiryId: string,
) {
  const inquiry = await prisma.inquiryRequest.findUniqueOrThrow({
    where: { id: inquiryId },
    include: {
      artistProfile: { select: { bandName: true, bandSlug: true } },
      clientProfile: { select: { userId: true } },
      quotes: { orderBy: { createdAt: "desc" } },
      gigThread: true,
    },
  })
  if (inquiry.clientProfile?.userId !== clientUserId) {
    throw new Error("FORBIDDEN")
  }
  if ((CLIENT_HIDDEN_STATUSES as readonly string[]).includes(inquiry.status)) {
    throw new Error("FORBIDDEN")
  }
  return inquiry
}

export type CreateInquiryInput = {
  artistProfileId: string
  contactName: string
  contactEmail: string
  contactPhone?: string
  eventType: EventTypeValue
  eventDate: Date
  eventCity?: string
  guestCount?: number
  budgetMinEur?: number
  budgetMaxEur?: number
  message?: string
}

/**
 * Creates a guest inquiry: upserts a CLIENT user + ClientProfile by email so
 * repeat inquiries from the same address attach to one account, then creates
 * the InquiryRequest (Gate 1: defaults to AWAITING_ARTIST_CONFIRMATION) and
 * its GigThread in one transaction.
 */
export async function createInquiry(input: CreateInquiryInput) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email: input.contactEmail },
      update: { name: input.contactName, phone: input.contactPhone },
      create: {
        email: input.contactEmail,
        name: input.contactName,
        phone: input.contactPhone,
        role: "CLIENT",
        status: "APPROVED",
      },
    })

    const clientProfile = await tx.clientProfile.upsert({
      where: { userId: user.id },
      update: { fullName: input.contactName, phone: input.contactPhone },
      create: {
        userId: user.id,
        fullName: input.contactName,
        phone: input.contactPhone,
      },
    })

    const inquiry = await tx.inquiryRequest.create({
      data: {
        artistProfileId: input.artistProfileId,
        clientProfileId: clientProfile.id,
        contactName: input.contactName,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        eventType: input.eventType,
        eventDate: input.eventDate,
        eventCity: input.eventCity,
        guestCount: input.guestCount,
        budgetMinEur: input.budgetMinEur,
        budgetMaxEur: input.budgetMaxEur,
        message: input.message,
      },
    })

    await tx.gigThread.create({
      data: {
        inquiryId: inquiry.id,
        artistProfileId: input.artistProfileId,
      },
    })

    return { inquiry, user }
  })
}

/** Gate 1: artist confirms an inquiry is worth pursuing — it becomes active and gets a calendar hold. */
export async function confirmInquiry(userId: string, inquiryId: string) {
  const inquiry = await prisma.inquiryRequest.findUniqueOrThrow({
    where: { id: inquiryId },
  })
  await assertArtistAccess(userId, inquiry.artistProfileId)
  if (inquiry.status !== "AWAITING_ARTIST_CONFIRMATION") {
    throw new Error("INVALID_STATE")
  }

  await prisma.inquiryRequest.update({
    where: { id: inquiryId },
    data: { status: "NEW" },
  })

  await createAvailabilityEntry(inquiry.artistProfileId, {
    type: "PENDING_QUOTE",
    title: "Pending quote hold",
    startDate: inquiry.eventDate,
    endDate: inquiry.eventDate,
    isPublicBusy: true,
  })
}

/** Gate 1: artist declines — the inquiry is silently closed, the customer is never told. */
export async function declineInquiryGate1(userId: string, inquiryId: string) {
  const inquiry = await prisma.inquiryRequest.findUniqueOrThrow({
    where: { id: inquiryId },
  })
  await assertArtistAccess(userId, inquiry.artistProfileId)
  if (inquiry.status !== "AWAITING_ARTIST_CONFIRMATION") {
    throw new Error("INVALID_STATE")
  }

  await prisma.inquiryRequest.update({
    where: { id: inquiryId },
    data: { status: "CANCELLED" },
  })
}

export async function updateInquiryStatus(
  userId: string,
  inquiryId: string,
  status: "IN_REVIEW" | "DECLINED" | "CANCELLED",
) {
  const inquiry = await prisma.inquiryRequest.findUniqueOrThrow({
    where: { id: inquiryId },
  })
  await assertArtistAccess(userId, inquiry.artistProfileId)

  return prisma.inquiryRequest.update({
    where: { id: inquiryId },
    data: { status },
  })
}
