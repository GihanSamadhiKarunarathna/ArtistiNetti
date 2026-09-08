"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import {
  getThreadForAgent,
  getThreadForArtist,
  getThreadForClient,
  sendMessage,
} from "@/server/services/messaging"

async function assertThreadAccess(
  threadId: string,
  userId: string,
  role: "CLIENT" | "ARTIST" | "AGENT" | "ADMIN",
) {
  if (role === "CLIENT") return getThreadForClient(threadId, userId)
  if (role === "ARTIST") return getThreadForArtist(threadId, userId)
  if (role === "AGENT") return getThreadForAgent(threadId, userId)
  throw new Error("FORBIDDEN")
}

export async function sendMessageAction(threadId: string, body: string) {
  const session = await auth()
  if (!session?.user) throw new Error("UNAUTHENTICATED")
  if (!body.trim()) return

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { role: true },
  })

  await assertThreadAccess(threadId, session.user.id, user.role)
  await sendMessage(threadId, session.user.id, user.role, body.trim())
  revalidatePath(`/artist/messages/${threadId}`)
  revalidatePath(`/client/messages/${threadId}`)
  revalidatePath(`/agent/messages/${threadId}`)
}
