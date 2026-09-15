import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { ArrowUpRight, MapPin, Music4 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/i18n/navigation"

export type ArtistCardData = {
  bandSlug: string
  bandName: string
  bio: string | null
  bioEn: string | null
  genres: string[]
  city: string | null
  region: string | null
  minBudgetEur: number | null
  heroImageUrl: string | null
}

export function ArtistCard({ artist }: { artist: ArtistCardData }) {
  const t = useTranslations()
  const locale = useLocale()
  const bio = locale === "en" && artist.bioEn ? artist.bioEn : artist.bio

  return (
    <Link
      href={`/${artist.bandSlug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
        {artist.heroImageUrl ? (
          <Image
            src={artist.heroImageUrl}
            alt={artist.bandName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Music4 className="size-10" aria-hidden />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        {artist.minBudgetEur != null && (
          <span className="absolute right-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm">
            {t("discover.startingFrom")} {artist.minBudgetEur}€
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">{artist.bandName}</h3>
          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
        </div>
        {(artist.city || artist.region) && (
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5" />
            {[artist.city, artist.region].filter(Boolean).join(", ")}
          </p>
        )}
        {bio && <p className="line-clamp-2 text-sm text-muted-foreground">{bio}</p>}
        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {artist.genres.slice(0, 3).map((genre) => (
            <Badge key={genre} variant="secondary">
              {t.has(`genres.${genre}`) ? t(`genres.${genre}`) : genre}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  )
}
