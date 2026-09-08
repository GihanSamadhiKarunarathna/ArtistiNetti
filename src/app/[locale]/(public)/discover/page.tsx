import { getTranslations } from "next-intl/server"
import { ArtistCard } from "@/components/shared/artist-card"
import { DiscoverFilters } from "@/components/features/discovery/discover-filters"
import { getDistinctCities, searchArtists } from "@/server/services/discovery"

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const [t, cities, artists] = await Promise.all([
    getTranslations("discover"),
    getDistinctCities(),
    searchArtists({
      genre: params.genre,
      city: params.city,
      eventType: params.eventType,
      budgetMax: params.budgetMax ? Number(params.budgetMax) : undefined,
    }),
  ])

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>

      <div className="mt-8 rounded-xl border bg-card p-4">
        <DiscoverFilters cities={cities} />
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        {t("resultsCount", { count: artists.length })}
      </p>

      {artists.length > 0 ? (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <p>{t("resultsCount", { count: 0 })}</p>
        </div>
      )}
    </div>
  )
}
