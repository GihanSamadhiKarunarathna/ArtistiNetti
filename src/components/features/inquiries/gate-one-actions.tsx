"use client"

import { useTransition } from "react"
import { Check, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { confirmInquiryAction, declineInquiryAction } from "@/server/actions/inquiries"

export function GateOneActions({ inquiryId }: { inquiryId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="sm"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await confirmInquiryAction(inquiryId)
            toast.success("Inquiry confirmed — it's now active")
          })
        }
      >
        <Check />
        Accept
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await declineInquiryAction(inquiryId)
            toast("Inquiry declined")
          })
        }
      >
        <X />
        Decline
      </Button>
    </div>
  )
}
