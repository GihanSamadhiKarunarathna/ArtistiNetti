import { prisma } from "@/lib/db"
import { getPaymentProvider } from "@/lib/payments"
import type { CreateQuoteInput } from "@/lib/validation/quote"

export async function createQuote(
  ownerUserId: string,
  inquiryId: string,
  data: CreateQuoteInput,
) {
  const inquiry = await prisma.inquiryRequest.findUniqueOrThrow({
    where: { id: inquiryId },
    include: { artistProfile: { select: { ownerUserId: true } } },
  })
  if (inquiry.artistProfile.ownerUserId !== ownerUserId) throw new Error("FORBIDDEN")

  const [quote] = await prisma.$transaction([
    prisma.quote.create({
      data: {
        inquiryId,
        createdByUserId: ownerUserId,
        amountEur: data.amountEur,
        depositEur: data.depositEur,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
        termsText: data.termsText,
        status: "SENT",
        sentAt: new Date(),
      },
    }),
    prisma.inquiryRequest.update({
      where: { id: inquiryId },
      data: { status: "QUOTED" },
    }),
  ])

  return quote
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
    where: { clientProfileId: clientProfile.id },
    orderBy: { createdAt: "desc" },
    include: {
      artistProfile: { select: { bandName: true, bandSlug: true, heroImageUrl: true } },
      quotes: { orderBy: { createdAt: "desc" } },
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
