import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { Music4 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
    <Card className="overflow-hidden pt-0 transition-shadow hover:shadow-md">
      <div className="relative aspect-4/3 w-full bg-muted">
        {artist.heroImageUrl ? (
          <Image
            src={artist.heroImageUrl}
            alt={artist.bandName}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Music4 className="size-10" aria-hidden />
          </div>
        )}
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">{artist.bandName}</h3>
        </div>
        {(artist.city || artist.region) && (
          <p className="text-sm text-muted-foreground">
            {[artist.city, artist.region].filter(Boolean).join(", ")}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {bio && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{bio}</p>
        )}
        <div className="flex flex-wrap gap-1.5">
          {artist.genres.slice(0, 3).map((genre) => (
            <Badge key={genre} variant="secondary">
              {t.has(`genres.${genre}`) ? t(`genres.${genre}`) : genre}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2 border-t pt-4">
        {artist.minBudgetEur != null ? (
          <span className="text-sm font-medium">
            {t("discover.startingFrom")} {artist.minBudgetEur}€
          </span>
        ) : (
          <span />
        )}
        <Button asChild size="sm" variant="outline">
          <Link href={`/${artist.bandSlug}`}>{t("discover.viewProfile")}</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
