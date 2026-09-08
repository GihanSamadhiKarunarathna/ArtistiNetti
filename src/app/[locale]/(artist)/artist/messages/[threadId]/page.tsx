import { getTranslations } from "next-intl/server"
import { MessageThread } from "@/components/features/messaging/message-thread"
import { requireRole } from "@/lib/auth"
import { getThreadForArtist } from "@/server/services/messaging"

export default async function ArtistMessageThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>
}) {
  const { threadId } = await params
  const [user, t] = await Promise.all([
    requireRole("ARTIST"),
    getTranslations("messaging"),
  ])
  const thread = await getThreadForArtist(threadId, user.id)

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">
        {t("title")} — {thread.inquiry.contactName}
      </h1>
      <MessageThread
        threadId={thread.id}
        currentUserRole="ARTIST"
        messages={thread.messages.map((m) => ({
          id: m.id,
          body: m.body,
          senderRole: m.senderRole,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}
