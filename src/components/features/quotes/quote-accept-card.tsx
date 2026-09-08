"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { acceptQuoteAction, declineQuoteAction } from "@/server/actions/quotes"

export function QuoteAcceptCard({
  quoteId,
  amountEur,
  depositEur,
}: {
  quoteId: string
  amountEur: number
  depositEur: number | null
}) {
  const t = useTranslations("quotes")
  const [isPending, startTransition] = useTransition()
  const payAmount = depositEur ?? amountEur

  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription>{t("mockPaymentNotice")}</AlertDescription>
      </Alert>
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await acceptQuoteAction(quoteId)
              toast.success(t("paymentSuccess"))
            })
          }
        >
          {t("payDeposit", { amount: `${payAmount}€` })}
        </Button>
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await declineQuoteAction(quoteId)
              toast("Quote declined")
            })
          }
        >
          {t("declineQuote")}
        </Button>
      </div>
    </div>
  )
}
