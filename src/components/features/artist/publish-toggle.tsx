"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { togglePublishAction } from "@/server/actions/artist-profile"

export function PublishToggle({
  isPublished,
  approvalStatus,
}: {
  isPublished: boolean
  approvalStatus: string
}) {
  const t = useTranslations("artistDashboard")
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      const result = await togglePublishAction(!isPublished)
      if (result.error === "notApproved") {
        toast.error("Your profile must be approved by an admin before you can publish it.")
        return
      }
      toast.success(isPublished ? "Profile unpublished" : "Profile published!")
    })
  }

  return (
    <div className="flex items-center gap-3">
      <Badge variant={isPublished ? "default" : "secondary"}>
        {isPublished ? "Live" : approvalStatus === "APPROVED" ? "Not published" : "Awaiting approval"}
      </Badge>
      <Button
        type="button"
        variant={isPublished ? "outline" : "default"}
        size="sm"
        disabled={isPending}
        onClick={handleToggle}
      >
        {isPublished ? t("unpublishProfile") : t("publishProfile")}
      </Button>
    </div>
  )
}
