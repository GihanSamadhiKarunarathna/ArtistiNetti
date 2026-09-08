"use client"

import { useRef, useTransition } from "react"
import { format } from "date-fns"
import { Send } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { sendMessageAction } from "@/server/actions/messaging"

export type MessageData = {
  id: string
  body: string
  senderRole: string
  createdAt: string
}

export function MessageThread({
  threadId,
  messages,
  currentUserRole,
}: {
  threadId: string
  messages: MessageData[]
  currentUserRole: "CLIENT" | "ARTIST" | "AGENT" | "ADMIN"
}) {
  const t = useTranslations("messaging")
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex h-[32rem] flex-col rounded-xl border">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">{t("noMessages")}</p>
        )}
        {messages.map((message) => {
          const isOwn = message.senderRole === currentUserRole
          return (
            <div
              key={message.id}
              className={cn("flex", isOwn ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                  isOwn
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                <p className="whitespace-pre-line">{message.body}</p>
                <p
                  className={cn(
                    "mt-1 text-[10px] opacity-70",
                    isOwn ? "text-right" : "text-left",
                  )}
                >
                  {format(new Date(message.createdAt), "d MMM HH:mm")}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <form
        ref={formRef}
        action={(formData) => {
          const body = String(formData.get("body") ?? "")
          startTransition(async () => {
            await sendMessageAction(threadId, body)
            formRef.current?.reset()
          })
        }}
        className="flex items-end gap-2 border-t p-3"
      >
        <Textarea
          name="body"
          placeholder={t("placeholder")}
          rows={1}
          required
          className="min-h-9 resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              formRef.current?.requestSubmit()
            }
          }}
        />
        <Button type="submit" size="icon" disabled={isPending}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  )
}
