import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import type {
  RegisterArtistInput,
  RegisterAgentInput,
} from "@/lib/validation/auth"

const BLOCKED_LOGIN_STATUSES = new Set(["SUSPENDED", "REJECTED"])

export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.passwordHash) return null

  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) return null
  if (BLOCKED_LOGIN_STATUSES.has(user.status)) return null

  return user
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

async function uniqueBandSlug(bandName: string) {
  const base = slugify(bandName) || "artist"
  let slug = base
  let suffix = 1
  while (await prisma.artistProfile.findUnique({ where: { bandSlug: slug } })) {
    suffix += 1
    slug = `${base}-${suffix}`
  }
  return slug
}

/**
 * Every band always represents a tenant "agency" — self-represented bands get
 * their own auto-created agency-of-one at signup. Two-step create because the
 * owner's BandMember row needs the user's id, and the ArtistProfile needs the
 * agency's id.
 */
export async function registerArtist(input: RegisterArtistInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  })
  if (existing) throw new Error("EMAIL_TAKEN")

  const passwordHash = await bcrypt.hash(input.password, 10)
  const bandSlug = await uniqueBandSlug(input.bandName)

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: input.email,
        name: input.fullName,
        phone: input.phone,
        passwordHash,
        role: "ARTIST",
        status: "PENDING",
      },
    })

    const ownAgency = await tx.agency.create({
      data: {
        name: input.bandName,
        isSelfManaged: true,
      },
    })

    const artistProfile = await tx.artistProfile.create({
      data: {
        ownerUserId: user.id,
        agencyId: ownAgency.id,
        ownAgencyId: ownAgency.id,
        bandSlug,
        bandName: input.bandName,
        bio: input.bio,
        genres: input.genres,
        city: input.city,
        region: input.region,
        country: input.country,
        minBudgetEur: input.minBudgetEur,
        eventTypes: input.eventTypes,
        members: {
          create: {
            userId: user.id,
            displayName: input.fullName,
            isOwner: true,
          },
        },
      },
    })

    return { ...user, artistProfile }
  })
}

export async function registerAgent(input: RegisterAgentInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  })
  if (existing) throw new Error("EMAIL_TAKEN")

  const passwordHash = await bcrypt.hash(input.password, 10)

  return prisma.$transaction(async (tx) => {
    const agency = await tx.agency.create({
      data: {
        name: input.agencyName,
        businessId: input.businessId || null,
        defaultCommissionPct: input.commissionPct,
      },
    })

    const user = await tx.user.create({
      data: {
        email: input.email,
        name: input.fullName,
        phone: input.phone,
        passwordHash,
        role: "AGENT",
        status: "PENDING",
        agentProfile: {
          create: {
            agencyId: agency.id,
            isPrimaryAdmin: true,
          },
        },
      },
      include: { agentProfile: true },
    })

    return user
  })
}
