import { prisma } from "@/lib/db"

export async function getOwnAgentProfile(userId: string) {
  return prisma.agentProfile.findUniqueOrThrow({
    where: { userId },
    include: {
      managedArtists: {
        select: {
          id: true,
          bandName: true,
          bandSlug: true,
          city: true,
          isPublished: true,
          approvalStatus: true,
        },
      },
    },
  })
}

export async function addArtistByEmail(agentUserId: string, artistEmail: string) {
  const agentProfile = await prisma.agentProfile.findUniqueOrThrow({
    where: { userId: agentUserId },
  })

  const artistUser = await prisma.user.findUnique({
    where: { email: artistEmail },
    include: { artistProfile: true },
  })

  if (!artistUser?.artistProfile) throw new Error("ARTIST_NOT_FOUND")
  if (artistUser.artistProfile.agentId) throw new Error("ALREADY_MANAGED")

  return prisma.artistProfile.update({
    where: { id: artistUser.artistProfile.id },
    data: { agentId: agentProfile.id },
  })
}

export async function getArtistForAgent(agentUserId: string, artistProfileId: string) {
  const artist = await prisma.artistProfile.findUniqueOrThrow({
    where: { id: artistProfileId },
    include: { agent: { select: { userId: true } } },
  })
  if (artist.agent?.userId !== agentUserId) throw new Error("FORBIDDEN")
  return artist
}
