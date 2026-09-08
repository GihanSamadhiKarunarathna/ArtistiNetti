import NextAuth from "next-auth"
import createMiddleware from "next-intl/middleware"
import { NextResponse } from "next/server"
import { authConfig } from "@/lib/auth/auth.config"
import { routing } from "@/i18n/routing"

const { auth } = NextAuth(authConfig)
const intlMiddleware = createMiddleware(routing)

const nonDefaultLocales = routing.locales.filter(
  (locale) => locale !== routing.defaultLocale,
)
const localePrefixPattern = new RegExp(`^/(${nonDefaultLocales.join("|")})(/|$)`)

const ROLE_FOR_PREFIX: Record<string, string> = {
  admin: "ADMIN",
  artist: "ARTIST",
  agent: "AGENT",
  client: "CLIENT",
}

export default auth((req) => {
  const { nextUrl } = req
  const localeMatch = nextUrl.pathname.match(localePrefixPattern)
  const localePrefix = localeMatch ? `/${localeMatch[1]}` : ""
  const pathWithoutLocale =
    nextUrl.pathname.slice(localePrefix.length) || "/"

  const firstSegment = pathWithoutLocale.split("/").filter(Boolean)[0]
  const requiredRole = firstSegment ? ROLE_FOR_PREFIX[firstSegment] : undefined

  if (requiredRole) {
    const role = req.auth?.user?.role

    if (!role) {
      const loginUrl = new URL(`${localePrefix}/login`, nextUrl.origin)
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (role !== requiredRole) {
      return NextResponse.redirect(new URL(`${localePrefix}/`, nextUrl.origin))
    }
  }

  return intlMiddleware(req)
})

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
