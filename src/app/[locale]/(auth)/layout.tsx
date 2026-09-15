import Image from "next/image"
import { Music4, ShieldCheck, Sparkles } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { LocaleSwitcher } from "@/components/layout/locale-switcher"
import { Link } from "@/i18n/navigation"
import { DEMO_PHOTOS } from "@/lib/demo-images"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const t = await getTranslations("landing")

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <Image
          src={DEMO_PHOTOS.concertStage}
          alt=""
          fill
          priority
          className="object-cover opacity-40"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-linear-to-t from-primary via-primary/80 to-primary/40" />

        <Link href="/" className="relative z-10 flex items-center gap-2 font-semibold">
          <Music4 className="size-6" aria-hidden />
          ArtistiNetti
        </Link>

        <div className="relative z-10 space-y-6">
          <p className="text-balance text-3xl font-semibold leading-tight">
            {t("heroTitle")}
          </p>
          <div className="space-y-3 text-sm text-primary-foreground/90">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 shrink-0" />
              {t("forArtistsPoint1")}
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 shrink-0" />
              {t("forArtistsPoint3")}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between p-6">
          <Link href="/" className="flex items-center gap-2 font-semibold lg:hidden">
            <Music4 className="size-5 text-primary" aria-hidden />
            ArtistiNetti
          </Link>
          <div className="ml-auto">
            <LocaleSwitcher />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 pb-16">
          {children}
        </div>
      </div>
    </div>
  )
}
