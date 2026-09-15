import Image from "next/image"
import {
  ArrowRight,
  CalendarCheck,
  MessagesSquare,
  Quote,
  Search,
  Sparkles,
} from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArtistCard } from "@/components/shared/artist-card"
import { Link } from "@/i18n/navigation"
import { GENRES } from "@/lib/constants"
import { DEMO_PHOTOS } from "@/lib/demo-images"
import { getFeaturedArtists, getPublicStats } from "@/server/services/discovery"

const STEP_ICONS = [Search, MessagesSquare, CalendarCheck]

export default async function LandingPage() {
  const [t, featuredArtists, stats] = await Promise.all([
    getTranslations(),
    getFeaturedArtists(6),
    getPublicStats(),
  ])

  const steps = [1, 2, 3].map((n) => ({
    Icon: STEP_ICONS[n - 1],
    title: t(`landing.step${n}Title`),
    body: t(`landing.step${n}Body`),
  }))

  const statItems = [
    { value: `${stats.artistCount}+`, label: t("landing.statsArtists") },
    { value: `${stats.genreCount}+`, label: t("landing.statsGenres") },
    { value: `${stats.cityCount}+`, label: t("landing.statsCities") },
  ]

  const testimonials = [1, 2, 3].map((n) => ({
    quote: t(`landing.testimonial${n}Quote`),
    name: t(`landing.testimonial${n}Name`),
    role: t(`landing.testimonial${n}Role`),
  }))

  const forArtistPoints = [1, 2, 3].map((n) => t(`landing.forArtistsPoint${n}`))

  return (
    <div>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <Image
          src={DEMO_PHOTOS.festivalCrowd}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/70 to-background" />
        <div className="absolute inset-0 bg-linear-to-t from-primary/30 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-4xl px-4 py-28 text-center sm:px-6 sm:py-36 lg:px-8">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
            <Sparkles className="size-3.5 text-primary-foreground" />
            {t("landing.heroBadge")}
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {t("landing.heroTitle")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-white/80">
            {t("landing.heroSubtitle")}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/discover">
                {t("landing.ctaFindArtist")}
                <ArrowRight />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white"
              asChild
            >
              <Link href="/register">{t("landing.ctaJoin")}</Link>
            </Button>
          </div>

          <dl className="mx-auto mt-16 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-8">
            {statItems.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-3xl font-bold text-white">{stat.value}</dd>
                <p className="mt-1 text-xs text-white/70 sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold">{t("landing.howItWorksTitle")}</h2>
          <p className="mt-3 text-muted-foreground">{t("landing.howItWorksSubtitle")}</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map(({ Icon, title, body }, i) => (
            <div
              key={title}
              className="group relative rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
                <Icon className="size-5" aria-hidden />
              </div>
              <p className="text-xs font-semibold tracking-wide text-primary">
                STEP {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-1 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured artists */}
      {featuredArtists.length > 0 && (
        <section className="border-y bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold">{t("landing.featuredArtists")}</h2>
                <p className="mt-2 text-muted-foreground">
                  {t("landing.featuredArtistsSubtitle")}
                </p>
              </div>
              <Button variant="link" asChild className="shrink-0">
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

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-semibold">
          {t("landing.testimonialsTitle")}
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="flex flex-col rounded-2xl border bg-card p-6 shadow-sm"
            >
              <Quote className="size-6 text-primary/40" aria-hidden />
              <blockquote className="mt-3 flex-1 text-sm text-muted-foreground">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t pt-4">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {testimonial.name.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Browse by genre */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold">{t("landing.browseByGenre")}</h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {GENRES.map((genre) => (
            <Link key={genre} href={{ pathname: "/discover", query: { genre } }}>
              <Badge
                variant="outline"
                className="rounded-full px-4 py-1.5 text-sm transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                {t(`genres.${genre}`)}
              </Badge>
            </Link>
          ))}
        </div>
      </section>

      {/* For artists CTA */}
      <section className="relative overflow-hidden border-t bg-primary text-primary-foreground">
        <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-black/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            {t("landing.forArtistsTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-balance text-primary-foreground/90">
            {t("landing.forArtistsBody")}
          </p>
          <ul className="mx-auto mt-8 flex max-w-xl flex-col gap-3 text-left sm:flex-row sm:justify-center sm:text-center">
            {forArtistPoints.map((point) => (
              <li
                key={point}
                className="flex-1 rounded-xl bg-white/10 px-4 py-3 text-sm backdrop-blur-sm"
              >
                {point}
              </li>
            ))}
          </ul>
          <Button size="lg" variant="secondary" className="mt-9" asChild>
            <Link href="/register">{t("landing.ctaJoin")}</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
