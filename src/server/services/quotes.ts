import { prisma } from "@/lib/db"
import { getPaymentProvider } from "@/lib/payments"
import { isBandMemberOfArtist } from "@/server/services/artist-profile"
import type { CreateQuoteInput } from "@/lib/validation/quote"

async function resolveQuoteCreator(userId: string, artistProfileId: string) {
  if (await isBandMemberOfArtist(userId, artistProfileId)) {
    return { requiresGate2: false as const }
  }

  const artist = await prisma.artistProfile.findUniqueOrThrow({
    where: { id: artistProfileId },
    select: { agencyId: true },
  })
  const agentProfile = await prisma.agentProfile.findUnique({ where: { userId } })
  if (agentProfile && agentProfile.agencyId === artist.agencyId) {
    return { requiresGate2: true as const }
  }

  throw new Error("FORBIDDEN")
}

/**
 * Gate 2: a band member's own quote goes straight out (SENT). A quote drafted
 * by the representing agency's staff needs the band's approval first
 * (AWAITING_ARTIST_APPROVAL) before the customer ever sees it. If a quote for
 * this inquiry already exists in DRAFT (i.e. it was previously rejected at
 * Gate 2), this updates and resubmits it instead of creating a duplicate.
 */
export async function createQuote(
  userId: string,
  inquiryId: string,
  data: CreateQuoteInput,
) {
  const inquiry = await prisma.inquiryRequest.findUniqueOrThrow({
    where: { id: inquiryId },
    select: { artistProfileId: true },
  })
  const { requiresGate2 } = await resolveQuoteCreator(userId, inquiry.artistProfileId)

  const existingDraft = await prisma.quote.findFirst({
    where: { inquiryId, status: "DRAFT" },
    orderBy: { createdAt: "desc" },
  })

  const baseData = {
    amountEur: data.amountEur,
    depositEur: data.depositEur,
    validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
    termsText: data.termsText,
  }

  if (existingDraft) {
    return prisma.quote.update({
      where: { id: existingDraft.id },
      data: {
        ...baseData,
        status: requiresGate2 ? "AWAITING_ARTIST_APPROVAL" : "SENT",
        artistRejectionNote: null,
        sentAt: requiresGate2 ? undefined : new Date(),
      },
    })
  }

  const [quote] = await prisma.$transaction([
    prisma.quote.create({
      data: {
        inquiryId,
        createdByUserId: userId,
        ...baseData,
        status: requiresGate2 ? "AWAITING_ARTIST_APPROVAL" : "SENT",
        sentAt: requiresGate2 ? undefined : new Date(),
      },
    }),
    prisma.inquiryRequest.update({
      where: { id: inquiryId },
      data: { status: "QUOTED" },
    }),
  ])

  return quote
}

/** Gate 2: the band approves an agency-drafted quote, releasing it to the customer. */
export async function approveQuote(userId: string, quoteId: string) {
  const quote = await prisma.quote.findUniqueOrThrow({
    where: { id: quoteId },
    include: { inquiry: { select: { artistProfileId: true } } },
  })
  if (quote.status !== "AWAITING_ARTIST_APPROVAL") throw new Error("INVALID_STATE")
  if (!(await isBandMemberOfArtist(userId, quote.inquiry.artistProfileId))) {
    throw new Error("FORBIDDEN")
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.quote.update({
      where: { id: quoteId },
      data: {
        status: "SENT",
        sentAt: new Date(),
        artistApprovedAt: new Date(),
      },
    })
    await tx.inquiryRequest.update({
      where: { id: quote.inquiryId },
      data: { status: "QUOTED" },
    })
    return updated
  })
}

/** Gate 2: the band rejects an agency-drafted quote — it reverts to DRAFT, never reaching the client. */
export async function rejectQuote(userId: string, quoteId: string, note: string) {
  const quote = await prisma.quote.findUniqueOrThrow({
    where: { id: quoteId },
    include: { inquiry: { select: { artistProfileId: true } } },
  })
  if (!(await isBandMemberOfArtist(userId, quote.inquiry.artistProfileId))) {
    throw new Error("FORBIDDEN")
  }
  if (quote.status !== "AWAITING_ARTIST_APPROVAL") throw new Error("INVALID_STATE")

  return prisma.quote.update({
    where: { id: quoteId },
    data: { status: "DRAFT", artistRejectionNote: note },
  })
}

export async function getQuoteForClient(quoteId: string, clientUserId: string) {
  const quote = await prisma.quote.findUniqueOrThrow({
    where: { id: quoteId },
    include: {
      inquiry: {
        include: {
          artistProfile: { select: { bandName: true, bandSlug: true } },
          clientProfile: { select: { userId: true } },
        },
      },
      transactions: true,
    },
  })
  if (quote.inquiry.clientProfile?.userId !== clientUserId) throw new Error("FORBIDDEN")
  return quote
}

export async function listQuotesForClient(clientUserId: string) {
  const clientProfile = await prisma.clientProfile.findUnique({
    where: { userId: clientUserId },
    select: { id: true },
  })
  if (!clientProfile) return []

  return prisma.inquiryRequest.findMany({
    where: {
      clientProfileId: clientProfile.id,
      status: { notIn: ["AWAITING_ARTIST_CONFIRMATION", "CANCELLED"] },
    },
    orderBy: { createdAt: "desc" },
    include: {
      artistProfile: { select: { bandName: true, bandSlug: true, heroImageUrl: true } },
      quotes: {
        where: { status: { not: "DRAFT" } },
        orderBy: { createdAt: "desc" },
      },
    },
  })
}

export async function acceptQuote(quoteId: string, clientUserId: string) {
  const quote = await getQuoteForClient(quoteId, clientUserId)
  if (quote.status !== "SENT") throw new Error("INVALID_STATE")

  const inquiry = await prisma.inquiryRequest.findUniqueOrThrow({
    where: { id: quote.inquiryId },
    select: { artistProfileId: true, eventDate: true },
  })

  const provider = getPaymentProvider()
  const depositAmount = quote.depositEur ?? quote.amountEur

  const checkout = await provider.createCheckout({
    amountEur: depositAmount,
    currency: quote.currency,
    reference: quote.id,
  })

  return prisma.$transaction(async (tx) => {
    await tx.quote.update({
      where: { id: quoteId },
      data: { status: "ACCEPTED", respondedAt: new Date() },
    })
    await tx.inquiryRequest.update({
      where: { id: quote.inquiryId },
      data: { status: "ACCEPTED" },
    })
    // Clear the Gate-1 pending-quote hold — it's now a firm confirmed booking.
    await tx.availabilityEntry.deleteMany({
      where: { artistProfileId: inquiry.artistProfileId, type: "PENDING_QUOTE" },
    })
    const transaction = await tx.transaction.create({
      data: {
        quoteId,
        purpose: quote.depositEur ? "DEPOSIT" : "FULL",
        provider: "MOCK",
        providerRef: checkout.providerRef,
        amountEur: depositAmount,
        currency: quote.currency,
        status: "CAPTURED",
        payerUserId: clientUserId,
      },
    })
    await tx.availabilityEntry.create({
      data: {
        artistProfileId: inquiry.artistProfileId,
        type: "CONFIRMED_GIG",
        startDate: inquiry.eventDate,
        endDate: inquiry.eventDate,
        title: "Confirmed booking",
        relatedInquiryId: quote.inquiryId,
      },
    })
    return transaction
  })
}

export async function declineQuote(quoteId: string, clientUserId: string) {
  const quote = await getQuoteForClient(quoteId, clientUserId)
  await prisma.$transaction([
    prisma.quote.update({
      where: { id: quoteId },
      data: { status: "DECLINED", respondedAt: new Date() },
    }),
    prisma.inquiryRequest.update({
      where: { id: quote.inquiryId },
      data: { status: "DECLINED" },
    }),
  ])
}
