"use client"

import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "@/i18n/navigation"
import { GENRES, EVENT_TYPES } from "@/lib/constants"

const ALL = "__all__"

export function DiscoverFilters({ cities }: { cities: string[] }) {
  const t = useTranslations("discover.filters")
  const tGenres = useTranslations("genres")
  const tEventTypes = useTranslations("eventTypes")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === ALL) params.delete(key)
    else params.set(key, value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-40 space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">{t("genre")}</label>
        <Select
          value={searchParams.get("genre") ?? ALL}
          onValueChange={(v) => setParam("genre", v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("anyGenre")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("anyGenre")}</SelectItem>
            {GENRES.map((genre) => (
              <SelectItem key={genre} value={genre}>
                {tGenres(genre)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-40 space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">{t("city")}</label>
        <Select
          value={searchParams.get("city") ?? ALL}
          onValueChange={(v) => setParam("city", v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("anyCity")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("anyCity")}</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-44 space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">{t("eventType")}</label>
        <Select
          value={searchParams.get("eventType") ?? ALL}
          onValueChange={(v) => setParam("eventType", v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("anyEventType")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("anyEventType")}</SelectItem>
            {EVENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {tEventTypes(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-36 space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">{t("budget")}</label>
        <Input
          type="number"
          min={0}
          placeholder="EUR"
          defaultValue={searchParams.get("budgetMax") ?? ""}
          onBlur={(e) => setParam("budgetMax", e.target.value)}
        />
      </div>

      {searchParams.size > 0 && (
        <Button variant="ghost" size="sm" onClick={() => router.push(pathname)}>
          {tCommon("clearFilters")}
        </Button>
      )}
    </div>
  )
}
