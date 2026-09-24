import { prisma } from "@/lib/db"
import type {
  UpdateArtistProfileInput,
  UpdateBandMemberInput,
} from "@/lib/validation/artist-profile"

/**
 * Resolves the band workspace a signed-in user can access: either they own it
 * (`ArtistProfile.ownerUserId`) or they're an invited `BandMember` with a
 * linked login. This is what makes the shared-workspace model work — every
 * artist-area page/action calls this instead of assuming the user is the
 * owner.
 */
export async function getArtistProfileForMember(userId: string) {
  const profile = await prisma.artistProfile.findFirst({
    where: {
      OR: [{ ownerUserId: userId }, { members: { some: { userId } } }],
    },
    include: {
      members: { orderBy: { createdAt: "asc" } },
      agency: true,
      ownAgency: true,
    },
  })
  if (!profile) throw new Error("NO_ARTIST_PROFILE")

  const membership = profile.members.find((m) => m.userId === userId)
  const isOwner = profile.ownerUserId === userId
  return { ...profile, isOwner, membership: membership ?? null }
}

async function requireOwner(userId: string) {
  const profile = await getArtistProfileForMember(userId)
  if (!profile.isOwner) throw new Error("FORBIDDEN")
  return profile
}

export async function isBandMemberOfArtist(userId: string, artistProfileId: string) {
  const match = await prisma.artistProfile.findFirst({
    where: {
      id: artistProfileId,
      OR: [{ ownerUserId: userId }, { members: { some: { userId } } }],
    },
    select: { id: true },
  })
  return Boolean(match)
}

/** Throws unless `userId` owns or is an invited member of `artistProfileId`. */
export async function assertArtistAccess(userId: string, artistProfileId: string) {
  if (!(await isBandMemberOfArtist(userId, artistProfileId))) {
    throw new Error("FORBIDDEN")
  }
}

export async function updateArtistProfile(
  userId: string,
  data: UpdateArtistProfileInput,
) {
  const profile = await getArtistProfileForMember(userId)
  return prisma.artistProfile.update({
    where: { id: profile.id },
    data,
  })
}

export async function setPublished(userId: string, isPublished: boolean) {
  const profile = await getArtistProfileForMember(userId)

  if (isPublished && profile.approvalStatus !== "APPROVED") {
    throw new Error("NOT_APPROVED")
  }

  return prisma.artistProfile.update({
    where: { id: profile.id },
    data: { isPublished },
  })
}

export async function updateMediaFields(
  userId: string,
  data: Partial<{
    heroImageUrl: string
    techRiderUrl: string
    stagePlanUrl: string
    galleryImageUrls: string[]
  }>,
) {
  const profile = await getArtistProfileForMember(userId)
  return prisma.artistProfile.update({
    where: { id: profile.id },
    data,
  })
}

export async function addGalleryImage(userId: string, url: string) {
  const profile = await getArtistProfileForMember(userId)
  return prisma.artistProfile.update({
    where: { id: profile.id },
    data: { galleryImageUrls: [...profile.galleryImageUrls, url] },
  })
}

export async function removeBandMember(userId: string, memberId: string) {
  const profile = await requireOwner(userId)
  const member = await prisma.bandMember.findUniqueOrThrow({
    where: { id: memberId },
  })
  if (member.artistProfileId !== profile.id) throw new Error("FORBIDDEN")
  if (member.isOwner) throw new Error("CANNOT_REMOVE_OWNER")

  await prisma.bandMember.delete({ where: { id: memberId } })
}

export async function updateBandMemberPermissions(
  userId: string,
  memberId: string,
  data: UpdateBandMemberInput,
) {
  const profile = await requireOwner(userId)
  const member = await prisma.bandMember.findUniqueOrThrow({
    where: { id: memberId },
  })
  if (member.artistProfileId !== profile.id) throw new Error("FORBIDDEN")

  return prisma.bandMember.update({ where: { id: memberId }, data })
}
