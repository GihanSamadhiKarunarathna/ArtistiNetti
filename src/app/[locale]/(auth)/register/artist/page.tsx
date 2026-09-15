import { getTranslations } from "next-intl/server"
import { ArtistRegisterForm } from "@/components/features/auth/artist-register-form"
import { Link } from "@/i18n/navigation"

export default async function RegisterArtistPage() {
  const t = await getTranslations("register")

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="space-y-1.5 text-center sm:text-left">
        <h1 className="text-2xl font-semibold">{t("artistTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("artistSubtitle")}</p>
      </div>
      <ArtistRegisterForm />
      <p className="text-center text-sm text-muted-foreground">
        {t("alreadyHaveAccount")}{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t("chooseRole")}
        </Link>
      </p>
    </div>
  )
}
