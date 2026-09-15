import { SearchX } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"
import { ArtistCard } from "@/components/shared/artist-card"
import { DiscoverFilters } from "@/components/features/discovery/discover-filters"
import { Link } from "@/i18n/navigation"
import { getDistinctCities, searchArtists } from "@/server/services/discovery"

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const [t, tCommon, cities, artists] = await Promise.all([
    getTranslations("discover"),
    getTranslations("common"),
    getDistinctCities(),
    searchArtists({
      genre: params.genre,
      city: params.city,
      eventType: params.eventType,
      budgetMax: params.budgetMax ? Number(params.budgetMax) : undefined,
    }),
  ])

  return (
    <div>
      <div className="border-b bg-linear-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold sm:text-4xl">{t("title")}</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
          <DiscoverFilters cities={cities} />
        </div>

        <p className="mt-6 text-sm font-medium text-muted-foreground">
          {t("resultsCount", { count: artists.length })}
        </p>

        {artists.length > 0 ? (
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed py-20 text-center">
            <SearchX className="size-8 text-muted-foreground" aria-hidden />
            <p className="text-muted-foreground">{t("resultsCount", { count: 0 })}</p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/discover">{tCommon("clearFilters")}</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
