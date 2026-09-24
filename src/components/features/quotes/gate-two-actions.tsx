"use client"

import { useState, useTransition } from "react"
import { Check, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { approveQuoteAction, rejectQuoteAction } from "@/server/actions/quotes"

export function GateTwoActions({ quoteId }: { quoteId: string }) {
  const [isPending, startTransition] = useTransition()
  const [note, setNote] = useState("")
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        size="sm"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await approveQuoteAction(quoteId)
            toast.success("Quote approved and sent to the client")
          })
        }
      >
        <Check />
        Approve & send
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" size="sm" variant="outline" disabled={isPending}>
            <X />
            Reject
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this quote</DialogTitle>
          </DialogHeader>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Tell the agent what to change..."
            rows={4}
          />
          <DialogFooter>
            <Button
              type="button"
              disabled={isPending || !note.trim()}
              onClick={() =>
                startTransition(async () => {
                  await rejectQuoteAction(quoteId, note)
                  toast("Quote sent back for revision")
                  setOpen(false)
                })
              }
            >
              Send feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
