import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["fi", "en"],
  defaultLocale: "fi",
  localePrefix: "as-needed",
})

export type AppLocale = (typeof routing.locales)[number]
