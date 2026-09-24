import { prisma } from "@/lib/db"

export async function getOwnAgentProfile(userId: string) {
  return prisma.agentProfile.findUniqueOrThrow({
    where: { userId },
    include: {
      agency: {
        include: {
          artists: {
            select: {
              id: true,
              bandName: true,
              bandSlug: true,
              city: true,
              isPublished: true,
              approvalStatus: true,
            },
          },
          staff: { include: { user: { select: { name: true, email: true } } } },
        },
      },
    },
  })
}

/** Links an existing artist account to this agent's agency, by the artist's account email. */
export async function addArtistByEmail(agentUserId: string, artistEmail: string) {
  const agentProfile = await prisma.agentProfile.findUniqueOrThrow({
    where: { userId: agentUserId },
  })

  const artistUser = await prisma.user.findUnique({
    where: { email: artistEmail },
    include: { artistProfile: true },
  })

  if (!artistUser?.artistProfile) throw new Error("ARTIST_NOT_FOUND")
  if (artistUser.artistProfile.agencyId === agentProfile.agencyId) {
    throw new Error("ALREADY_MANAGED")
  }

  return prisma.artistProfile.update({
    where: { id: artistUser.artistProfile.id },
    data: { agencyId: agentProfile.agencyId },
  })
}

export async function getArtistForAgent(agentUserId: string, artistProfileId: string) {
  const agentProfile = await prisma.agentProfile.findUniqueOrThrow({
    where: { userId: agentUserId },
  })
  const artist = await prisma.artistProfile.findUniqueOrThrow({
    where: { id: artistProfileId },
  })
  if (artist.agencyId !== agentProfile.agencyId) throw new Error("FORBIDDEN")
  return artist
}
