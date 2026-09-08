import { Mic2, Briefcase, ArrowRight } from "lucide-react"
import { getTranslations } from "next-intl/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"

export default async function RegisterChooserPage() {
  const t = await getTranslations("register")

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-center text-3xl font-semibold">{t("chooseRole")}</h1>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <Mic2 className="size-8 text-primary" aria-hidden />
            <CardTitle>{t("artistCardTitle")}</CardTitle>
            <CardDescription>{t("artistCardBody")}</CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Button asChild className="w-full">
              <Link href="/register/artist">
                {t("submitArtist")}
                <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <Briefcase className="size-8 text-primary" aria-hidden />
            <CardTitle>{t("agentCardTitle")}</CardTitle>
            <CardDescription>{t("agentCardBody")}</CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Button asChild variant="outline" className="w-full">
              <Link href="/register/agent">
                {t("submitAgent")}
                <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
