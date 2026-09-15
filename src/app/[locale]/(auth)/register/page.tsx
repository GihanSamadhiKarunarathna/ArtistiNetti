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
    <div className="w-full max-w-2xl">
      <h1 className="text-center text-2xl font-semibold sm:text-3xl">
        {t("chooseRole")}
      </h1>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Card className="flex flex-col transition-all hover:-translate-y-1 hover:shadow-lg">
          <CardHeader>
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Mic2 className="size-6" aria-hidden />
            </div>
            <CardTitle className="pt-2">{t("artistCardTitle")}</CardTitle>
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

        <Card className="flex flex-col transition-all hover:-translate-y-1 hover:shadow-lg">
          <CardHeader>
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Briefcase className="size-6" aria-hidden />
            </div>
            <CardTitle className="pt-2">{t("agentCardTitle")}</CardTitle>
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
