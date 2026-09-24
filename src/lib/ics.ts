type IcsEvent = {
  uid: string
  startDate: Date
  endDate: Date
  summary: string
}

function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
}

function escapeIcsText(text: string): string {
  return text.replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n")
}

/**
 * Minimal hand-rolled iCalendar (RFC 5545) feed generator — just enough for a
 * subscribable "busy" feed, so no dependency is needed for this one format.
 */
export function buildIcsFeed(calendarName: string, events: IcsEvent[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ArtistiNetti//Availability//EN",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
  ]

  for (const event of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.uid}@artistinetti.fi`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(event.startDate)}`,
      `DTEND:${formatIcsDate(event.endDate)}`,
      `SUMMARY:${escapeIcsText(event.summary)}`,
      "END:VEVENT",
    )
  }

  lines.push("END:VCALENDAR")
  return lines.join("\r\n")
}
