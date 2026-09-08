import { Music4 } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"

export async function SiteFooter() {
  const t = await getTranslations("footer")

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center gap-2 font-semibold">
            <Music4 className="size-5 text-primary" aria-hidden />
            <span>ArtistiNetti</span>
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            {t("tagline")}
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-medium">{t("forClients")}</p>
          <Link
            href="/discover"
            className="block text-muted-foreground hover:text-foreground"
          >
            {t("forClients")}
          </Link>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-medium">{t("company")}</p>
          <Link
            href="/register"
            className="block text-muted-foreground hover:text-foreground"
          >
            {t("forArtists")}
          </Link>
          <Link
            href="/register"
            className="block text-muted-foreground hover:text-foreground"
          >
            {t("forAgents")}
          </Link>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ArtistiNetti. {t("rights")}
      </div>
    </footer>
  )
}
