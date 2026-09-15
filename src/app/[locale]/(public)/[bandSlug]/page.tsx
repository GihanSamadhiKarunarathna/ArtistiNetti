import Image from "next/image"
import { notFound } from "next/navigation"
import { FileText, MapPin, Music4 } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { spotifyEmbedUrl, youtubeEmbedUrl } from "@/lib/embeds"
import { getPublicArtistBySlug } from "@/server/services/discovery"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bandSlug: string }>
}) {
  const { bandSlug } = await params
  const artist = await getPublicArtistBySlug(bandSlug)
  if (!artist) return {}

  return {
    title: artist.bandName,
    description: artist.bio ?? undefined,
    openGraph: artist.heroImageUrl
      ? { images: [artist.heroImageUrl] }
      : undefined,
  }
}

export default async function ArtistPublicPage({
  params,
}: {
  params: Promise<{ bandSlug: string }>
}) {
  const { bandSlug } = await params
  const [artist, t, tGenres, tEventTypes, locale] = await Promise.all([
    getPublicArtistBySlug(bandSlug),
    getTranslations("artistProfile"),
    getTranslations("genres"),
    getTranslations("eventTypes"),
    getLocale(),
  ])

  if (!artist) notFound()

  const bio = locale === "en" && artist.bioEn ? artist.bioEn : artist.bio
  const spotify = artist.spotifyUrl ? spotifyEmbedUrl(artist.spotifyUrl) : null
  const youtube = artist.youtubeUrl ? youtubeEmbedUrl(artist.youtubeUrl) : null

  return (
    <div>
      <div className="relative h-72 w-full bg-muted sm:h-96">
        {artist.heroImageUrl ? (
          <Image
            src={artist.heroImageUrl}
            alt={artist.bandName}
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Music4 className="size-16 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="-mt-8 flex flex-col justify-between gap-6 rounded-2xl border bg-card p-6 shadow-lg sm:-mt-10 sm:flex-row sm:items-end sm:p-7">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">{artist.bandName}</h1>
            {(artist.city || artist.region) && (
              <p className="mt-1 flex items-center gap-1 text-muted-foreground">
                <MapPin className="size-4" />
                {t("location")}: {[artist.city, artist.region].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
          <Button size="lg" asChild>
            <Link href={`/inquiry/${artist.bandSlug}`}>{t("requestQuote")}</Link>
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          {artist.minBudgetEur != null && (
            <Badge variant="outline" className="text-sm">
              {t("startingPrice", { price: `${artist.minBudgetEur}€` })}
            </Badge>
          )}
          <div className="flex flex-wrap gap-1.5">
            {artist.genres.map((genre) => (
              <Badge key={genre} variant="secondary">
                {tGenres.has(genre) ? tGenres(genre) : genre}
              </Badge>
            ))}
          </div>
        </div>

        {bio && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold">{t("about")}</h2>
            <p className="mt-3 whitespace-pre-line text-muted-foreground">{bio}</p>
          </section>
        )}

        {artist.eventTypes.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold">{t("eventTypes")}</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {artist.eventTypes.map((type) => (
                <Badge key={type} variant="outline">
                  {tEventTypes.has(type) ? tEventTypes(type) : type}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {(spotify || youtube) && (
          <section className="mt-10 grid gap-6 sm:grid-cols-2">
            {spotify && (
              <div>
                <h2 className="mb-3 text-xl font-semibold">{t("listenOn")}</h2>
                <iframe
                  src={spotify}
                  className="w-full rounded-xl"
                  height={352}
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>
            )}
            {youtube && (
              <div>
                <h2 className="mb-3 text-xl font-semibold">{t("watchOn")}</h2>
                <iframe
                  src={youtube}
                  className="aspect-video w-full rounded-xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  loading="lazy"
                />
              </div>
            )}
          </section>
        )}

        {artist.galleryImageUrls.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold">{t("gallery")}</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {artist.galleryImageUrls.map((url) => (
                <div
                  key={url}
                  className="group relative aspect-square overflow-hidden rounded-xl bg-muted"
                >
                  <Image
                    src={url}
                    alt={artist.bandName}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {(artist.techRiderUrl || artist.stagePlanUrl) && (
          <section className="mt-10 flex flex-wrap gap-3">
            {artist.techRiderUrl && (
              <Button variant="outline" asChild>
                <a href={artist.techRiderUrl} target="_blank" rel="noreferrer">
                  <FileText />
                  {t("techRider")}
                </a>
              </Button>
            )}
            {artist.stagePlanUrl && (
              <Button variant="outline" asChild>
                <a href={artist.stagePlanUrl} target="_blank" rel="noreferrer">
                  <FileText />
                  {t("stagePlan")}
                </a>
              </Button>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
