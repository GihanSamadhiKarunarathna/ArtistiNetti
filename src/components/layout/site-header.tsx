import { Music4 } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { LocaleSwitcher } from "./locale-switcher"
import { MobileNav } from "./mobile-nav"
import { UserMenu } from "./user-menu"

const DASHBOARD_HREF: Record<string, string> = {
  ADMIN: "/admin",
  ARTIST: "/artist/dashboard",
  AGENT: "/agent/dashboard",
  CLIENT: "/client/quotes",
}

export async function SiteHeader() {
  const [t, session] = await Promise.all([getTranslations("nav"), auth()])
  const user = session?.user
  const dashboardHref = user ? (DASHBOARD_HREF[user.role] ?? "/") : "/"

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Music4 className="size-6 text-primary" aria-hidden />
          <span>ArtistiNetti</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            href="/discover"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("discover")}
          </Link>
          <Link
            href="/#how-it-works"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("howItWorks")}
          </Link>
          {!user && (
            <Link
              href="/register"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("forArtists")}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          {user ? (
            <UserMenu
              name={user.name ?? null}
              email={user.email ?? ""}
              dashboardHref={dashboardHref}
            />
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/login">{t("login")}</Link>
              </Button>
              <Button asChild className="hidden sm:inline-flex">
                <Link href="/register">{t("register")}</Link>
              </Button>
            </>
          )}
          <MobileNav
            isLoggedIn={Boolean(user)}
            dashboardHref={dashboardHref}
            labels={{
              discover: t("discover"),
              howItWorks: t("howItWorks"),
              forArtists: t("forArtists"),
              login: t("login"),
              register: t("register"),
              dashboard: t("dashboard"),
              logout: t("logout"),
            }}
          />
        </div>
      </div>
    </header>
  )
}
