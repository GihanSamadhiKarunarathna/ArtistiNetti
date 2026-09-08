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

export async function registerArtist(input: RegisterArtistInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  })
  if (existing) throw new Error("EMAIL_TAKEN")

  const passwordHash = await bcrypt.hash(input.password, 10)
  const bandSlug = await uniqueBandSlug(input.bandName)

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.fullName,
      phone: input.phone,
      passwordHash,
      role: "ARTIST",
      status: "PENDING",
      artistProfile: {
        create: {
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
              displayName: input.fullName,
              isOwner: true,
            },
          },
        },
      },
    },
    include: { artistProfile: true },
  })

  return user
}

export async function registerAgent(input: RegisterAgentInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  })
  if (existing) throw new Error("EMAIL_TAKEN")

  const passwordHash = await bcrypt.hash(input.password, 10)

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.fullName,
      phone: input.phone,
      passwordHash,
      role: "AGENT",
      status: "PENDING",
      agentProfile: {
        create: {
          agencyName: input.agencyName,
          commissionPct: input.commissionPct,
        },
      },
    },
    include: { agentProfile: true },
  })

  return user
}
