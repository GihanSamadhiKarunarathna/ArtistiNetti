import { prisma } from "@/lib/db"
import type { EventTypeValue } from "@/lib/constants"

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

export async function getInquiryForArtist(
  ownerUserId: string,
  inquiryId: string,
) {
  const inquiry = await prisma.inquiryRequest.findUniqueOrThrow({
    where: { id: inquiryId },
    include: {
      artistProfile: { select: { ownerUserId: true, id: true, bandName: true } },
      quotes: { orderBy: { createdAt: "desc" } },
      gigThread: true,
    },
  })
  if (inquiry.artistProfile.ownerUserId !== ownerUserId) {
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
 * the InquiryRequest and its GigThread in one transaction.
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

export async function updateInquiryStatus(
  ownerUserId: string,
  inquiryId: string,
  status: "IN_REVIEW" | "DECLINED" | "CANCELLED",
) {
  const inquiry = await prisma.inquiryRequest.findUniqueOrThrow({
    where: { id: inquiryId },
    include: { artistProfile: { select: { ownerUserId: true } } },
  })
  if (inquiry.artistProfile.ownerUserId !== ownerUserId) throw new Error("FORBIDDEN")

  return prisma.inquiryRequest.update({
    where: { id: inquiryId },
    data: { status },
  })
}
