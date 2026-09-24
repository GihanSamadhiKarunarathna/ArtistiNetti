import bcrypt from "bcryptjs"
import { nanoid } from "nanoid"
import { prisma } from "@/lib/db"
import { getArtistProfileForMember } from "@/server/services/artist-profile"

const INVITE_EXPIRY_HOURS = 72

function expiryDate() {
  return new Date(Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000)
}

export async function switchArtistAgency(userId: string, businessId: string) {
  const profile = await getArtistProfileForMember(userId)
  if (!profile.isOwner) throw new Error("FORBIDDEN")

  const targetAgency = await prisma.agency.findUnique({ where: { businessId } })
  if (!targetAgency) throw new Error("AGENCY_NOT_FOUND")
  if (targetAgency.id === profile.agencyId) throw new Error("ALREADY_REPRESENTED")

  return prisma.artistProfile.update({
    where: { id: profile.id },
    data: { agencyId: targetAgency.id },
  })
}

export async function revertToSelfManaged(userId: string) {
  const profile = await getArtistProfileForMember(userId)
  if (!profile.isOwner) throw new Error("FORBIDDEN")

  return prisma.artistProfile.update({
    where: { id: profile.id },
    data: { agencyId: profile.ownAgencyId },
  })
}

export async function updateAgency(
  userId: string,
  data: { name: string; businessId?: string | null },
) {
  const agentProfile = await prisma.agentProfile.findUniqueOrThrow({ where: { userId } })
  if (!agentProfile.isPrimaryAdmin) throw new Error("FORBIDDEN")

  return prisma.agency.update({
    where: { id: agentProfile.agencyId },
    data: { name: data.name, businessId: data.businessId || null },
  })
}

export async function createAgencyInvite(userId: string, email: string, name: string) {
  const agentProfile = await prisma.agentProfile.findUniqueOrThrow({ where: { userId } })
  if (!agentProfile.isPrimaryAdmin) throw new Error("FORBIDDEN")

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error("EMAIL_TAKEN")

  return prisma.agencyInvite.create({
    data: {
      agencyId: agentProfile.agencyId,
      email,
      name,
      token: nanoid(32),
      invitedByUserId: userId,
      expiresAt: expiryDate(),
    },
  })
}

export async function getAgencyInvite(token: string) {
  const invite = await prisma.agencyInvite.findUniqueOrThrow({
    where: { token },
    include: { agency: { select: { name: true } } },
  })
  if (invite.acceptedAt) throw new Error("ALREADY_ACCEPTED")
  if (invite.expiresAt < new Date()) throw new Error("EXPIRED")
  return invite
}

export async function acceptAgencyInvite(token: string, password: string) {
  const invite = await getAgencyInvite(token)
  const passwordHash = await bcrypt.hash(password, 10)

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: invite.email,
        name: invite.name,
        passwordHash,
        role: "AGENT",
        status: "APPROVED",
        agentProfile: {
          create: { agencyId: invite.agencyId, isPrimaryAdmin: false },
        },
      },
    })
    await tx.agencyInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    })
    return user
  })
}

export async function createBandInvite(
  userId: string,
  data: { email: string; displayName: string; instrument?: string },
) {
  const profile = await getArtistProfileForMember(userId)
  if (!profile.isOwner) throw new Error("FORBIDDEN")

  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) throw new Error("EMAIL_TAKEN")

  return prisma.bandInvite.create({
    data: {
      artistProfileId: profile.id,
      email: data.email,
      displayName: data.displayName,
      instrument: data.instrument,
      token: nanoid(32),
      invitedByUserId: userId,
      expiresAt: expiryDate(),
    },
  })
}

export async function listPendingBandInvites(artistProfileId: string) {
  return prisma.bandInvite.findMany({
    where: { artistProfileId, acceptedAt: null },
    orderBy: { createdAt: "desc" },
  })
}

export async function getBandInvite(token: string) {
  const invite = await prisma.bandInvite.findUniqueOrThrow({
    where: { token },
    include: { artistProfile: { select: { bandName: true } } },
  })
  if (invite.acceptedAt) throw new Error("ALREADY_ACCEPTED")
  if (invite.expiresAt < new Date()) throw new Error("EXPIRED")
  return invite
}

export async function acceptBandInvite(token: string, password: string) {
  const invite = await getBandInvite(token)
  const passwordHash = await bcrypt.hash(password, 10)

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: invite.email,
        name: invite.displayName,
        passwordHash,
        role: "ARTIST",
        status: "APPROVED",
      },
    })
    await tx.bandMember.create({
      data: {
        artistProfileId: invite.artistProfileId,
        userId: user.id,
        displayName: invite.displayName,
        instrument: invite.instrument,
      },
    })
    await tx.bandInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    })
    return user
  })
}
