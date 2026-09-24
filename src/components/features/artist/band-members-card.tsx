"use client"

import { useActionState, useTransition } from "react"
import { Trash2, Crown, Clock } from "lucide-react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldError } from "@/components/shared/form-error"
import { SubmitButton } from "@/components/shared/submit-button"
import { removeBandMemberAction, updateBandMemberAction } from "@/server/actions/artist-profile"
import { inviteBandMemberAction } from "@/server/actions/agency"
import type { ActionState } from "@/server/actions/auth"

export type BandMemberData = {
  id: string
  displayName: string
  instrument: string | null
  isOwner: boolean
  canManageCalendar: boolean
  canLogExpenses: boolean
}

export type PendingBandInvite = {
  id: string
  email: string
  displayName: string
  instrument: string | null
}

function MemberPermissionsForm({ member }: { member: BandMemberData }) {
  const action = updateBandMemberAction.bind(null, member.id)
  const [, formAction] = useActionState<ActionState, FormData>(action, null)

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      <label className="flex items-center gap-1.5">
        <Checkbox name="canManageCalendar" defaultChecked={member.canManageCalendar} />
        Calendar
      </label>
      <label className="flex items-center gap-1.5">
        <Checkbox name="canLogExpenses" defaultChecked={member.canLogExpenses} />
        Expenses
      </label>
      <SubmitButton variant="ghost" size="sm" className="h-auto p-1">
        Save
      </SubmitButton>
    </form>
  )
}

export function BandMembersCard({
  members,
  pendingInvites,
}: {
  members: BandMemberData[]
  pendingInvites: PendingBandInvite[]
}) {
  const t = useTranslations("artistDashboard")
  const [state, formAction] = useActionState<ActionState, FormData>(
    inviteBandMemberAction,
    null,
  )
  const [isPending, startTransition] = useTransition()
  const fieldErrors = state?.fieldErrors ?? {}

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
              className="flex flex-col gap-2 rounded-md border px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="flex items-center gap-2">
                {member.isOwner && <Crown className="size-3.5 text-primary" />}
                <span className="font-medium">{member.displayName}</span>
                {member.instrument && (
                  <span className="text-muted-foreground">· {member.instrument}</span>
                )}
              </span>
              <div className="flex items-center gap-3">
                {!member.isOwner && <MemberPermissionsForm member={member} />}
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
              </div>
            </li>
          ))}
          {pendingInvites.map((invite) => (
            <li
              key={invite.id}
              className="flex items-center justify-between rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-2">
                <Clock className="size-3.5" />
                {invite.displayName} · {invite.email}
              </span>
              <span className="text-xs">Invited</span>
            </li>
          ))}
        </ul>

        <Separator />

        <form action={formAction} className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <Label htmlFor="displayName" className="text-xs">Name</Label>
            <Input id="displayName" name="displayName" required className="w-36" />
            <FieldError messages={fieldErrors.displayName} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs">Email</Label>
            <Input id="email" name="email" type="email" required className="w-48" />
            <FieldError messages={fieldErrors.email} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="instrument" className="text-xs">{t("instrument")}</Label>
            <Input id="instrument" name="instrument" className="w-36" />
          </div>
          <SubmitButton variant="outline" size="sm">
            {t("addMember")}
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  )
}
