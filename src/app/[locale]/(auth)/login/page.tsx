import { getTranslations } from "next-intl/server"
import { LoginForm } from "@/components/features/auth/login-form"
import { Link } from "@/i18n/navigation"

export default async function LoginPage() {
  const [t, tRegister] = await Promise.all([
    getTranslations("auth"),
    getTranslations("register"),
  ])

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1.5 text-center sm:text-left">
        <h1 className="text-2xl font-semibold">{t("login")}</h1>
        <p className="text-sm text-muted-foreground">{t("loginSubtitle")}</p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          {tRegister("chooseRole")}
        </Link>
      </p>
    </div>
  )
}
