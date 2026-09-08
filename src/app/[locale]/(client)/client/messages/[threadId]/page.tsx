import { getTranslations } from "next-intl/server"
import { MessageThread } from "@/components/features/messaging/message-thread"
import { requireRole } from "@/lib/auth"
import { getThreadForClient } from "@/server/services/messaging"

export default async function ClientMessageThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>
}) {
  const { threadId } = await params
  const [user, t] = await Promise.all([
    requireRole("CLIENT"),
    getTranslations("messaging"),
  ])
  const thread = await getThreadForClient(threadId, user.id)

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">
        {t("title")} — {thread.artistProfile.bandName}
      </h1>
      <MessageThread
        threadId={thread.id}
        currentUserRole="CLIENT"
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
