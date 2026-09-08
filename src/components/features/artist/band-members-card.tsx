"use client"

import { useActionState, useTransition } from "react"
import { Trash2, Crown } from "lucide-react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SubmitButton } from "@/components/shared/submit-button"
import {
  addBandMemberAction,
  removeBandMemberAction,
} from "@/server/actions/artist-profile"
import type { ActionState } from "@/server/actions/auth"

export type BandMemberData = {
  id: string
  displayName: string
  instrument: string | null
  isOwner: boolean
}

export function BandMembersCard({ members }: { members: BandMemberData[] }) {
  const t = useTranslations("artistDashboard")
  const [, formAction] = useActionState<ActionState, FormData>(
    addBandMemberAction,
    null,
  )
  const [isPending, startTransition] = useTransition()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("bandMembersSection")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2">
                {member.isOwner && <Crown className="size-3.5 text-primary" />}
                <span className="font-medium">{member.displayName}</span>
                {member.instrument && (
                  <span className="text-muted-foreground">· {member.instrument}</span>
                )}
              </span>
              {!member.isOwner && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(() => removeBandMemberAction(member.id))
                  }
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              )}
            </li>
          ))}
        </ul>

        <form action={formAction} className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <Label htmlFor="displayName" className="text-xs">Name</Label>
            <Input id="displayName" name="displayName" required className="w-40" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="instrument" className="text-xs">{t("instrument")}</Label>
            <Input id="instrument" name="instrument" className="w-40" />
          </div>
          <SubmitButton variant="outline" size="sm">
            {t("addMember")}
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  )
}
