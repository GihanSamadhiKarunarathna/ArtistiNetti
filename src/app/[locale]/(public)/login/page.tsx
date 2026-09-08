import { getTranslations } from "next-intl/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LoginForm } from "@/components/features/auth/login-form"
import { Link } from "@/i18n/navigation"

export default async function LoginPage() {
  const [t, tRegister] = await Promise.all([
    getTranslations("auth"),
    getTranslations("register"),
  ])

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("login")}</CardTitle>
          <CardDescription>{t("loginSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <LoginForm />
          <p className="text-center text-sm text-muted-foreground">
            {t("noAccount")}{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              {tRegister("chooseRole")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
