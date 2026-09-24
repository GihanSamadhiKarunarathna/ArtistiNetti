import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { buildIcsFeed } from "@/lib/ics"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ artistId: string }> },
) {
  const { artistId } = await params

  const artist = await prisma.artistProfile.findUnique({
    where: { id: artistId },
    select: { bandName: true, isPublished: true },
  })
  if (!artist || !artist.isPublished) {
    return new NextResponse("Not found", { status: 404 })
  }

  const entries = await prisma.availabilityEntry.findMany({
    where: { artistProfileId: artistId, isPublicBusy: true },
    orderBy: { startDate: "asc" },
  })

  // Public feed intentionally only says "Busy" — gig/client details never leak here.
  const feed = buildIcsFeed(
    `${artist.bandName} — ArtistiNetti`,
    entries.map((entry) => ({
      uid: entry.id,
      startDate: entry.startDate,
      endDate: entry.endDate,
      summary: "Busy",
    })),
  )

  return new NextResponse(feed, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${artistId}.ics"`,
    },
  })
}
