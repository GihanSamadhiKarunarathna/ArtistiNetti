import { prisma } from "@/lib/db"
import { assertArtistAccess } from "@/server/services/artist-profile"

export async function getThreadForInquiry(inquiryId: string) {
  return prisma.gigThread.findUnique({
    where: { inquiryId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  })
}

export async function getThreadForClient(threadId: string, clientUserId: string) {
  const thread = await prisma.gigThread.findUniqueOrThrow({
    where: { id: threadId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      inquiry: { include: { clientProfile: { select: { userId: true } } } },
      artistProfile: { select: { bandName: true } },
    },
  })
  if (thread.inquiry.clientProfile?.userId !== clientUserId) throw new Error("FORBIDDEN")
  return thread
}

export async function getThreadForArtist(threadId: string, userId: string) {
  const thread = await prisma.gigThread.findUniqueOrThrow({
    where: { id: threadId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      inquiry: true,
      artistProfile: { select: { bandName: true } },
    },
  })
  await assertArtistAccess(userId, thread.artistProfileId)
  return thread
}

export async function getThreadForAgent(threadId: string, agentUserId: string) {
  const agentProfile = await prisma.agentProfile.findUniqueOrThrow({
    where: { userId: agentUserId },
  })
  const thread = await prisma.gigThread.findUniqueOrThrow({
    where: { id: threadId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      inquiry: true,
      artistProfile: { select: { bandName: true, agencyId: true } },
    },
  })
  if (thread.artistProfile.agencyId !== agentProfile.agencyId) {
    throw new Error("FORBIDDEN")
  }
  return thread
}

export async function sendMessage(
  threadId: string,
  senderUserId: string,
  senderRole: "CLIENT" | "ARTIST" | "AGENT" | "ADMIN",
  body: string,
) {
  return prisma.message.create({
    data: { gigThreadId: threadId, senderUserId, senderRole, body },
  })
}
