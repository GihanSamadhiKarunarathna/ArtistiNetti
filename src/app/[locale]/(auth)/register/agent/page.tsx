import { getTranslations } from "next-intl/server"
import { AgentRegisterForm } from "@/components/features/auth/agent-register-form"
import { Link } from "@/i18n/navigation"

export default async function RegisterAgentPage() {
  const t = await getTranslations("register")

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="space-y-1.5 text-center sm:text-left">
        <h1 className="text-2xl font-semibold">{t("agentTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("agentSubtitle")}</p>
      </div>
      <AgentRegisterForm />
      <p className="text-center text-sm text-muted-foreground">
        {t("alreadyHaveAccount")}{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t("chooseRole")}
        </Link>
      </p>
    </div>
  )
}
