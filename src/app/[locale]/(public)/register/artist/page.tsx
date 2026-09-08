import { getTranslations } from "next-intl/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArtistRegisterForm } from "@/components/features/auth/artist-register-form"
import { Link } from "@/i18n/navigation"

export default async function RegisterArtistPage() {
  const t = await getTranslations("register")

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("artistTitle")}</CardTitle>
          <CardDescription>{t("artistSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ArtistRegisterForm />
          <p className="text-center text-sm text-muted-foreground">
            {t("alreadyHaveAccount")}{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              {t("chooseRole")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
