import { prisma } from "@/lib/db"
import type {
  AddBandMemberInput,
  UpdateArtistProfileInput,
} from "@/lib/validation/artist-profile"

export async function getOwnArtistProfile(ownerUserId: string) {
  return prisma.artistProfile.findUniqueOrThrow({
    where: { ownerUserId },
    include: { members: { orderBy: { createdAt: "asc" } }, agent: true },
  })
}

export async function updateArtistProfile(
  ownerUserId: string,
  data: UpdateArtistProfileInput,
) {
  return prisma.artistProfile.update({
    where: { ownerUserId },
    data,
  })
}

export async function setPublished(ownerUserId: string, isPublished: boolean) {
  const profile = await prisma.artistProfile.findUniqueOrThrow({
    where: { ownerUserId },
  })

  if (isPublished && profile.approvalStatus !== "APPROVED") {
    throw new Error("NOT_APPROVED")
  }

  return prisma.artistProfile.update({
    where: { ownerUserId },
    data: { isPublished },
  })
}

export async function updateMediaFields(
  ownerUserId: string,
  data: Partial<{
    heroImageUrl: string
    techRiderUrl: string
    stagePlanUrl: string
    galleryImageUrls: string[]
  }>,
) {
  return prisma.artistProfile.update({
    where: { ownerUserId },
    data,
  })
}

export async function addGalleryImage(ownerUserId: string, url: string) {
  const profile = await prisma.artistProfile.findUniqueOrThrow({
    where: { ownerUserId },
    select: { id: true, galleryImageUrls: true },
  })
  return prisma.artistProfile.update({
    where: { id: profile.id },
    data: { galleryImageUrls: [...profile.galleryImageUrls, url] },
  })
}

export async function addBandMember(
  ownerUserId: string,
  data: AddBandMemberInput,
) {
  const profile = await prisma.artistProfile.findUniqueOrThrow({
    where: { ownerUserId },
    select: { id: true },
  })
  return prisma.bandMember.create({
    data: { artistProfileId: profile.id, ...data },
  })
}

export async function removeBandMember(ownerUserId: string, memberId: string) {
  const member = await prisma.bandMember.findUniqueOrThrow({
    where: { id: memberId },
    include: { artistProfile: { select: { ownerUserId: true } } },
  })
  if (member.artistProfile.ownerUserId !== ownerUserId) {
    throw new Error("FORBIDDEN")
  }
  if (member.isOwner) {
    throw new Error("CANNOT_REMOVE_OWNER")
  }
  await prisma.bandMember.delete({ where: { id: memberId } })
}
