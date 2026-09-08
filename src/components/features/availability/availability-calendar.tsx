"use client"

import { useMemo, useState, useTransition } from "react"
import { useActionState } from "react"
import { format } from "date-fns"
import { Plus, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FieldError } from "@/components/shared/form-error"
import { SubmitButton } from "@/components/shared/submit-button"
import {
  createAvailabilityAction,
  deleteAvailabilityAction,
} from "@/server/actions/availability"
import type { ActionState } from "@/server/actions/auth"
import { AVAILABILITY_TYPES } from "@/lib/constants"

export type AvailabilityEntryData = {
  id: string
  type: (typeof AVAILABILITY_TYPES)[number]
  title: string | null
  startDate: string
  endDate: string
  notes: string | null
  isPublicBusy: boolean
}

const TYPE_COLOR: Record<string, string> = {
  CONFIRMED_GIG: "bg-primary text-primary-foreground",
  HOLD: "bg-chart-3 text-black",
  BLOCKED: "bg-muted-foreground text-white",
  PENDING_QUOTE: "bg-chart-2 text-black",
}

const MODIFIER_CLASSNAMES: Record<string, string> = {
  CONFIRMED_GIG: "bg-primary text-primary-foreground rounded-full",
  HOLD: "bg-chart-3 text-black rounded-full",
  BLOCKED: "bg-muted-foreground text-white rounded-full",
  PENDING_QUOTE: "bg-chart-2 text-black rounded-full",
}

function AddEntryDialog() {
  const t = useTranslations("availability")
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState<ActionState, FormData>(
    createAvailabilityAction,
    null,
  )
  const fieldErrors = state?.fieldErrors ?? {}

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          {t("addEntry")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("addEntry")}</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            await formAction(formData)
            setOpen(false)
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="type">{t("legend")}</Label>
            <Select name="type" defaultValue="HOLD">
              <SelectTrigger id="type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONFIRMED_GIG">{t("typeConfirmed")}</SelectItem>
                <SelectItem value="HOLD">{t("typeHold")}</SelectItem>
                <SelectItem value="BLOCKED">{t("typeBlocked")}</SelectItem>
                <SelectItem value="PENDING_QUOTE">{t("typePending")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">{t("entryTitle")}</Label>
            <Input id="title" name="title" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t("startDate")}</Label>
              <Input id="startDate" name="startDate" type="date" required />
              <FieldError messages={fieldErrors.startDate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">{t("endDate")}</Label>
              <Input id="endDate" name="endDate" type="date" required />
              <FieldError messages={fieldErrors.endDate} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">{t("notes")}</Label>
            <Textarea id="notes" name="notes" rows={3} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox name="isPublicBusy" defaultChecked />
            {t("isPublicBusy")}
          </label>
          <DialogFooter>
            <SubmitButton>{t("addEntry")}</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function AvailabilityCalendar({
  entries,
}: {
  entries: AvailabilityEntryData[]
}) {
  const t = useTranslations("availability")
  const [isPending, startTransition] = useTransition()

  const modifiers = useMemo(() => {
    const byType: Record<string, Date[]> = {
      CONFIRMED_GIG: [],
      HOLD: [],
      BLOCKED: [],
      PENDING_QUOTE: [],
    }
    for (const entry of entries) {
      const start = new Date(entry.startDate)
      const end = new Date(entry.endDate)
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        byType[entry.type]?.push(new Date(d))
      }
    }
    return byType
  }, [entries])

  const upcoming = [...entries].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  )

  const typeLabel: Record<string, string> = {
    CONFIRMED_GIG: t("typeConfirmed"),
    HOLD: t("typeHold"),
    BLOCKED: t("typeBlocked"),
    PENDING_QUOTE: t("typePending"),
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
      <div className="space-y-4">
        <Calendar
          mode="multiple"
          selected={[]}
          onSelect={() => {}}
          modifiers={modifiers}
          modifiersClassNames={MODIFIER_CLASSNAMES}
          className="rounded-lg border"
        />
        <div className="space-y-1.5 text-sm">
          <p className="font-medium">{t("legend")}</p>
          {Object.entries(typeLabel).map(([type, label]) => (
            <div key={type} className="flex items-center gap-2">
              <span className={`size-2.5 rounded-full ${TYPE_COLOR[type]}`} />
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">{t("title")}</h2>
          <AddEntryDialog />
        </div>

        {upcoming.length === 0 && (
          <p className="text-sm text-muted-foreground">No entries yet.</p>
        )}

        <ul className="space-y-2">
          {upcoming.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <Badge className={TYPE_COLOR[entry.type]}>
                  {typeLabel[entry.type]}
                </Badge>
                <div>
                  <p className="text-sm font-medium">
                    {entry.title || typeLabel[entry.type]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(entry.startDate), "d MMM yyyy")}
                    {entry.startDate !== entry.endDate &&
                      ` – ${format(new Date(entry.endDate), "d MMM yyyy")}`}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={isPending}
                onClick={() =>
                  startTransition(() => deleteAvailabilityAction(entry.id))
                }
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
