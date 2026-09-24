"use client"

import { useState } from "react"
import { Check, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SubscribeCalendarButton({ artistId }: { artistId: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        const url = `${window.location.origin}/api/calendar/${artistId}`
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
    >
      {copied ? <Check /> : <LinkIcon />}
      {copied ? "Link copied" : "Subscribe (iCal)"}
    </Button>
  )
}
