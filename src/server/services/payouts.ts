import { prisma } from "@/lib/db"

/**
 * Computed, read-only payout transparency: agency commission comes off the
 * top, the remainder splits across band members by `payoutSharePct` (an even
 * split when none are set). Nothing here is persisted — it's recomputed from
 * the quote/roster each time so it always reflects the current roster.
 */
export async function getPayoutBreakdown(artistProfileId: string, quoteId: string) {
  const [artist, quote, members] = await Promise.all([
    prisma.artistProfile.findUniqueOrThrow({
      where: { id: artistProfileId },
      include: { agency: { select: { name: true, defaultCommissionPct: true } } },
    }),
    prisma.quote.findUniqueOrThrow({ where: { id: quoteId } }),
    prisma.bandMember.findMany({ where: { artistProfileId }, orderBy: { createdAt: "asc" } }),
  ])

  const commissionPct = Number(
    artist.commissionPctOverride ?? artist.agency.defaultCommissionPct,
  )
  const grossEur = quote.amountEur
  const commissionEur = Math.round(grossEur * (commissionPct / 100))
  const netPoolEur = grossEur - commissionEur

  const hasExplicitShares = members.some((m) => m.payoutSharePct != null)
  const evenSharePct = members.length > 0 ? 100 / members.length : 0

  const memberPayouts = members.map((member) => {
    const sharePct = hasExplicitShares
      ? Number(member.payoutSharePct ?? 0)
      : evenSharePct
    return {
      memberId: member.id,
      displayName: member.displayName,
      sharePct,
      amountEur: Math.round(netPoolEur * (sharePct / 100)),
    }
  })

  return {
    agencyName: artist.agency.name,
    isSelfManaged: artist.agencyId === artist.ownAgencyId,
    grossEur,
    commissionPct,
    commissionEur,
    netPoolEur,
    members: memberPayouts,
  }
}

export type PayoutBreakdown = Awaited<ReturnType<typeof getPayoutBreakdown>>
