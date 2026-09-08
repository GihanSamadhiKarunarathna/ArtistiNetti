import { ArrowRight, CalendarCheck, MessagesSquare, Search } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArtistCard } from "@/components/shared/artist-card"
import { Link } from "@/i18n/navigation"
import { GENRES } from "@/lib/constants"
import { getFeaturedArtists } from "@/server/services/discovery"

const STEP_ICONS = [Search, MessagesSquare, CalendarCheck]

export default async function LandingPage() {
  const [t, featuredArtists] = await Promise.all([
    getTranslations(),
    getFeaturedArtists(6),
  ])

  const steps = [1, 2, 3].map((n) => ({
    Icon: STEP_ICONS[n - 1],
    title: t(`landing.step${n}Title`),
    body: t(`landing.step${n}Body`),
  }))

  return (
    <div>
      <section className="relative overflow-hidden border-b bg-linear-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            {t("landing.heroTitle")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            {t("landing.heroSubtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/discover">
                {t("landing.ctaFindArtist")}
                <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register">{t("landing.ctaJoin")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-semibold">
          {t("landing.howItWorksTitle")}
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map(({ Icon, title, body }, i) => (
            <div key={title} className="relative rounded-xl border bg-card p-6">
              <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden />
              </div>
              <p className="text-xs font-semibold text-primary">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-1 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {featuredArtists.length > 0 && (
        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-3xl font-semibold">
                {t("landing.featuredArtists")}
              </h2>
              <Button variant="link" asChild>
                <Link href="/discover">
                  {t("common.viewAll")}
                  <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredArtists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold">{t("landing.browseByGenre")}</h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {GENRES.map((genre) => (
            <Button key={genre} variant="outline" size="sm" asChild>
              <Link href={{ pathname: "/discover", query: { genre } }}>
                <Badge variant="outline" className="border-none p-0 text-inherit">
                  {t(`genres.${genre}`)}
                </Badge>
              </Link>
            </Button>
          ))}
        </div>
      </section>

      <section className="border-t bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold">{t("landing.forArtistsTitle")}</h2>
          <p className="mx-auto mt-4 max-w-xl text-balance text-primary-foreground/90">
            {t("landing.forArtistsBody")}
          </p>
          <Button size="lg" variant="secondary" className="mt-8" asChild>
            <Link href="/register">{t("landing.ctaJoin")}</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
