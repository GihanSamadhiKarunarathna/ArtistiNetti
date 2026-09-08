import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/db"

export type ArtistFilters = {
  genre?: string
  city?: string
  eventType?: string
  budgetMax?: number
  query?: string
}

const PUBLISHED_WHERE = {
  isPublished: true,
  approvalStatus: "APPROVED",
} as const

export function artistCardSelect() {
  return {
    id: true,
    bandSlug: true,
    bandName: true,
    bio: true,
    bioEn: true,
    genres: true,
    city: true,
    region: true,
    minBudgetEur: true,
    eventTypes: true,
    heroImageUrl: true,
  } satisfies Prisma.ArtistProfileSelect
}

export async function searchArtists(filters: ArtistFilters) {
  const where: Prisma.ArtistProfileWhereInput = { ...PUBLISHED_WHERE }

  if (filters.genre) where.genres = { has: filters.genre }
  if (filters.eventType) where.eventTypes = { has: filters.eventType as never }
  if (filters.city) {
    where.OR = [
      { city: { equals: filters.city, mode: "insensitive" } },
      { region: { equals: filters.city, mode: "insensitive" } },
    ]
  }
  if (filters.budgetMax !== undefined) {
    where.minBudgetEur = { lte: filters.budgetMax }
  }
  if (filters.query) {
    where.bandName = { contains: filters.query, mode: "insensitive" }
  }

  return prisma.artistProfile.findMany({
    where,
    select: artistCardSelect(),
    orderBy: { updatedAt: "desc" },
    take: 60,
  })
}

export async function getFeaturedArtists(limit = 6) {
  return prisma.artistProfile.findMany({
    where: PUBLISHED_WHERE,
    select: artistCardSelect(),
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

export async function getPublicArtistBySlug(bandSlug: string) {
  return prisma.artistProfile.findFirst({
    where: { bandSlug, ...PUBLISHED_WHERE },
  })
}

export async function getDistinctCities() {
  const rows = await prisma.artistProfile.findMany({
    where: { ...PUBLISHED_WHERE, city: { not: null } },
    select: { city: true },
    distinct: ["city"],
  })
  return rows.map((r) => r.city).filter((c): c is string => Boolean(c))
}
