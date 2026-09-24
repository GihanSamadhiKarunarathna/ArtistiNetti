"use client"

import { useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"

export function PublicAvailabilityCalendar({
  busyRanges,
}: {
  busyRanges: { startDate: string; endDate: string }[]
}) {
  const busyDates = useMemo(() => {
    const dates: Date[] = []
    for (const range of busyRanges) {
      const start = new Date(range.startDate)
      const end = new Date(range.endDate)
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d))
      }
    }
    return dates
  }, [busyRanges])

  return (
    <div className="inline-block rounded-xl border p-2">
      <Calendar
        mode="multiple"
        selected={[]}
        onSelect={() => {}}
        disabled={{ before: new Date() }}
        modifiers={{ busy: busyDates }}
        modifiersClassNames={{ busy: "bg-destructive/15 text-destructive rounded-full" }}
      />
      <div className="flex items-center gap-2 border-t px-2 pt-2 text-xs text-muted-foreground">
        <span className="size-2.5 rounded-full bg-destructive/40" />
        Busy
      </div>
    </div>
  )
}
