"use client"

import { useLocale } from "next-intl"
import { useParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePathname, useRouter } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"

const LOCALE_LABELS: Record<string, string> = {
  fi: "Suomi",
  en: "English",
}

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()

  return (
    <Select
      value={locale}
      onValueChange={(nextLocale) => {
        router.replace(
          // @ts-expect-error -- pathname is dynamically typed by next-intl
          { pathname, params },
          { locale: nextLocale },
        )
      }}
    >
      <SelectTrigger size="sm" className="w-[100px]" aria-label="Language">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {routing.locales.map((l) => (
          <SelectItem key={l} value={l}>
            {LOCALE_LABELS[l] ?? l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
